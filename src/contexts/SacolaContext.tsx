import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

import type { Cupom, ItemCarrinho } from '@/features/carrinho/types'
import type {
  OpcaoCustomizacao,
  Produto,
} from '@/features/cardapio/types'
import { carregarEstado, salvarEstado } from '@/lib/persistencia'
import { valorDescontoVoucher } from '@/services/voucherApi'

const CHAVE = 'raizes_carrinho'

interface SacolaEstado {
  itens: ItemCarrinho[]
  cupom: Cupom | null
}

type SacolaAcao =
  | {
      tipo: 'ADICIONAR'
      produto: Produto
      quantidade: number
      selecoes: Record<string, OpcaoCustomizacao[]>
      observacoes?: string
    }
  | { tipo: 'REMOVER'; itemId: string }
  | { tipo: 'ATUALIZAR_QTD'; itemId: string; quantidade: number }
  | { tipo: 'APLICAR_CUPOM'; cupom: Cupom }
  | { tipo: 'REMOVER_CUPOM' }
  | { tipo: 'LIMPAR' }
  | { tipo: 'HIDRATAR'; estado: SacolaEstado }

function chaveItem(
  produto: Produto,
  selecoes: Record<string, OpcaoCustomizacao[]>,
  observacoes?: string,
): string {
  const partes = Object.entries(selecoes)
    .map(
      ([cId, opcoes]) =>
        `${cId}:${[...opcoes.map((o) => o.id)].sort().join('+')}`,
    )
    .sort()
    .join(';')
  return `${produto.id}|${partes}|${observacoes?.trim() ?? ''}`
}

function gerarItemId(): string {
  return `it_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function sacolaReducer(estado: SacolaEstado, acao: SacolaAcao): SacolaEstado {
  switch (acao.tipo) {
    case 'HIDRATAR':
      return acao.estado
    case 'ADICIONAR': {
      const { produto, quantidade, selecoes, observacoes } = acao
      if (quantidade <= 0) return estado
      const chave = chaveItem(produto, selecoes, observacoes)
      const existente = estado.itens.find(
        (it) => chaveItem(it.produto, it.selecoes, it.observacoes) === chave,
      )
      if (existente) {
        return {
          ...estado,
          itens: estado.itens.map((it) =>
            it.itemId === existente.itemId
              ? { ...it, quantidade: it.quantidade + quantidade }
              : it,
          ),
        }
      }
      const novo: ItemCarrinho = {
        itemId: gerarItemId(),
        produto,
        quantidade,
        selecoes,
        observacoes: observacoes?.trim() || undefined,
      }
      return { ...estado, itens: [...estado.itens, novo] }
    }
    case 'REMOVER':
      return {
        ...estado,
        itens: estado.itens.filter((it) => it.itemId !== acao.itemId),
      }
    case 'ATUALIZAR_QTD':
      if (acao.quantidade <= 0) {
        return {
          ...estado,
          itens: estado.itens.filter((it) => it.itemId !== acao.itemId),
        }
      }
      return {
        ...estado,
        itens: estado.itens.map((it) =>
          it.itemId === acao.itemId
            ? { ...it, quantidade: acao.quantidade }
            : it,
        ),
      }
    case 'APLICAR_CUPOM':
      return { ...estado, cupom: acao.cupom }
    case 'REMOVER_CUPOM':
      return { ...estado, cupom: null }
    case 'LIMPAR':
      return { itens: [], cupom: null }
    default:
      return estado
  }
}

export function precoLinhaSacola(item: ItemCarrinho): number {
  const extras = Object.values(item.selecoes)
    .flat()
    .reduce((acc, o) => acc + o.precoExtra, 0)
  return item.produto.preco + extras
}

interface SacolaContexto {
  itens: ItemCarrinho[]
  cupom: Cupom | null
  adicionarItem: (
    produto: Produto,
    quantidade: number,
    selecoes: Record<string, OpcaoCustomizacao[]>,
    observacoes?: string,
  ) => void
  removerItem: (itemId: string) => void
  alterarQuantidade: (itemId: string, quantidade: number) => void
  aplicarVoucher: (cupom: Cupom) => void
  removerVoucher: () => void
  esvaziarSacola: () => void
  totais: {
    subtotal: number
    desconto: number
    total: number
    qtdItens: number
  }
}

const SacolaCtx = createContext<SacolaContexto | null>(null)

export function SacolaProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(sacolaReducer, {
    itens: [],
    cupom: null,
  })

  useEffect(() => {
    const salvo = carregarEstado<{ state?: SacolaEstado }>(CHAVE, {})
    const hidratado = salvo.state ?? salvo
    if (hidratado && 'itens' in hidratado) {
      dispatch({ tipo: 'HIDRATAR', estado: hidratado as SacolaEstado })
    }
  }, [])

  useEffect(() => {
    salvarEstado(CHAVE, { state: estado })
  }, [estado])

  const adicionarItem = useCallback(
    (
      produto: Produto,
      quantidade: number,
      selecoes: Record<string, OpcaoCustomizacao[]>,
      observacoes?: string,
    ) => {
      dispatch({
        tipo: 'ADICIONAR',
        produto,
        quantidade,
        selecoes,
        observacoes,
      })
    },
    [],
  )

  const totais = useMemo(() => {
    const subtotal = estado.itens.reduce(
      (acc, it) => acc + precoLinhaSacola(it) * it.quantidade,
      0,
    )
    const desconto = estado.cupom
      ? valorDescontoVoucher(estado.cupom, subtotal)
      : 0
    const total = Math.max(0, subtotal - desconto)
    const qtdItens = estado.itens.reduce((acc, it) => acc + it.quantidade, 0)
    return { subtotal, desconto, total, qtdItens }
  }, [estado.itens, estado.cupom])

  const valor = useMemo(
    (): SacolaContexto => ({
      itens: estado.itens,
      cupom: estado.cupom,
      adicionarItem,
      removerItem: (itemId) => dispatch({ tipo: 'REMOVER', itemId }),
      alterarQuantidade: (itemId, quantidade) =>
        dispatch({ tipo: 'ATUALIZAR_QTD', itemId, quantidade }),
      aplicarVoucher: (cupom) => dispatch({ tipo: 'APLICAR_CUPOM', cupom }),
      removerVoucher: () => dispatch({ tipo: 'REMOVER_CUPOM' }),
      esvaziarSacola: () => dispatch({ tipo: 'LIMPAR' }),
      totais,
    }),
    [estado, adicionarItem, totais],
  )

  return <SacolaCtx.Provider value={valor}>{children}</SacolaCtx.Provider>
}

export function useSacolaContexto(): SacolaContexto {
  const ctx = useContext(SacolaCtx)
  if (!ctx) throw new Error('useSacolaContexto fora de SacolaProvider')
  return ctx
}
