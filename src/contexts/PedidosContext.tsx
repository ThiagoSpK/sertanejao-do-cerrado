import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'

import type { Cupom, ItemCarrinho } from '@/features/carrinho/types'
import { pontosPorValorPedido } from '@/features/fidelidade/types'
import type {
  CanalPedido,
  EventoStatus,
  MetodoPagamento,
  ModoRetirada,
  Pedido,
  StatusPedido,
} from '@/features/pedidos/types'
import { creditarPontosExterno } from '@/contexts/ProgramaContext'
import { carregarEstado, salvarEstado } from '@/lib/persistencia'

const CHAVE = 'raizes_pedidos'

export interface PayloadNovoPedido {
  unidadeId: string
  unidadeNome: string
  itens: ItemCarrinho[]
  cupom: Cupom | null
  subtotal: number
  desconto: number
  total: number
  metodoPagamento: MetodoPagamento
  modoRetirada: ModoRetirada
  canal: CanalPedido
  cpfCliente?: string
  transacaoId: string
}

interface PedidosEstado {
  pedidos: Pedido[]
}

type PedidosAcao =
  | { tipo: 'REGISTRAR'; pedido: Pedido }
  | { tipo: 'ATUALIZAR_STATUS'; pedidoId: string; status: StatusPedido }
  | { tipo: 'LIMPAR' }
  | { tipo: 'HIDRATAR'; pedidos: Pedido[] }

function gerarId(): string {
  return `pd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function gerarNumero(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function pedidosReducer(estado: PedidosEstado, acao: PedidosAcao): PedidosEstado {
  switch (acao.tipo) {
    case 'HIDRATAR':
      return { pedidos: acao.pedidos }
    case 'REGISTRAR':
      return { pedidos: [acao.pedido, ...estado.pedidos] }
    case 'ATUALIZAR_STATUS':
      return {
        pedidos: estado.pedidos.map((p) => {
          if (p.id !== acao.pedidoId) return p
          if (p.status === acao.status) return p
          if (p.status === 'cancelado' || p.status === 'retirado') return p
          return {
            ...p,
            status: acao.status,
            historico: [
              ...p.historico,
              { status: acao.status, em: new Date().toISOString() },
            ],
          }
        }),
      }
    case 'LIMPAR':
      return { pedidos: [] }
    default:
      return estado
  }
}

interface PedidosContexto {
  pedidos: Pedido[]
  registrarPedido: (dados: PayloadNovoPedido) => Pedido
  atualizarStatusPedido: (pedidoId: string, status: StatusPedido) => void
  obterPedido: (id: string) => Pedido | undefined
  limparPedidos: () => void
  recarregarPedidos: () => void
  hidratado: boolean
}

const PedidosCtx = createContext<PedidosContexto | null>(null)

export function PedidosProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(pedidosReducer, { pedidos: [] })
  const [hidratado, setHidratado] = useState(false)
  const pedidosRef = useRef(estado.pedidos)
  pedidosRef.current = estado.pedidos
  const timersRef = useRef<Map<string, number[]>>(new Map())
  const atualizarRef = useRef<(id: string, status: StatusPedido) => void>(
    () => {},
  )

  useEffect(() => {
    const salvo = carregarEstado<{ state?: { pedidos?: Pedido[] } }>(CHAVE, {})
    const lista =
      salvo.state?.pedidos ??
      (salvo as { pedidos?: Pedido[] }).pedidos ??
      []
    dispatch({ tipo: 'HIDRATAR', pedidos: lista })
    setHidratado(true)
  }, [])

  useEffect(() => {
    if (!hidratado) return
    salvarEstado(CHAVE, { state: { pedidos: estado.pedidos } })
  }, [estado.pedidos, hidratado])

  const atualizarStatusPedido = useCallback(
    (pedidoId: string, status: StatusPedido) => {
      const pedido = pedidosRef.current.find((p) => p.id === pedidoId)
      if (!pedido) return
      if (pedido.status === status) return
      if (pedido.status === 'cancelado' || pedido.status === 'retirado') return

      dispatch({ tipo: 'ATUALIZAR_STATUS', pedidoId, status })

      if (status === 'retirado') {
        const pts = pontosPorValorPedido(pedido.total)
        if (pts > 0) {
          creditarPontosExterno(
            pts,
            `Pedido #${pedido.numero} — Clube Pequi`,
            pedido.id,
          )
        }
      }
    },
    [],
  )

  atualizarRef.current = atualizarStatusPedido

  const agendarProgresso = useCallback((pedidoId: string, numero: string) => {
    const t1 = window.setTimeout(() => {
      atualizarRef.current(pedidoId, 'preparo')
    }, 5000)
    const t2 = window.setTimeout(() => {
      const atual = pedidosRef.current.find((p) => p.id === pedidoId)
      if (
        !atual ||
        atual.status === 'cancelado' ||
        atual.status === 'retirado'
      ) {
        return
      }
      atualizarRef.current(pedidoId, 'pronto')
      toast.success(`Pedido #${numero} liberado no balcão`, {
        description: 'Apresente o número ao retirar.',
        duration: 8000,
      })
    }, 30000)
    timersRef.current.set(pedidoId, [t1, t2])
  }, [])

  const registrarPedido = useCallback(
    (dados: PayloadNovoPedido): Pedido => {
      const agora = new Date().toISOString()
      const evento: EventoStatus = { status: 'recebido', em: agora }
      const pedido: Pedido = {
        id: gerarId(),
        numero: gerarNumero(),
        ...dados,
        status: 'recebido',
        historico: [evento],
        criadoEm: agora,
      }
      dispatch({ tipo: 'REGISTRAR', pedido })
      agendarProgresso(pedido.id, pedido.numero)
      return pedido
    },
    [agendarProgresso],
  )

  const obterPedido = useCallback(
    (id: string) => estado.pedidos.find((p) => p.id === id),
    [estado.pedidos],
  )

  const recarregarPedidos = useCallback(() => {
    const salvo = carregarEstado<{ state?: { pedidos?: Pedido[] } }>(CHAVE, {})
    const lista =
      salvo.state?.pedidos ??
      (salvo as { pedidos?: Pedido[] }).pedidos ??
      []
    dispatch({ tipo: 'HIDRATAR', pedidos: lista })
  }, [])

  const valor = useMemo(
    (): PedidosContexto => ({
      pedidos: estado.pedidos,
      registrarPedido,
      atualizarStatusPedido,
      obterPedido,
      limparPedidos: () => dispatch({ tipo: 'LIMPAR' }),
      recarregarPedidos,
      hidratado,
    }),
    [
      estado.pedidos,
      registrarPedido,
      atualizarStatusPedido,
      obterPedido,
      recarregarPedidos,
      hidratado,
    ],
  )

  return <PedidosCtx.Provider value={valor}>{children}</PedidosCtx.Provider>
}

export function usePedidosContexto(): PedidosContexto {
  const ctx = useContext(PedidosCtx)
  if (!ctx) throw new Error('usePedidosContexto fora de PedidosProvider')
  return ctx
}
