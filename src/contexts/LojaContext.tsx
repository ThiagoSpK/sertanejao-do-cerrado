import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

import type { Unidade } from '@/features/unidades/types'
import { carregarEstado, salvarEstado } from '@/lib/persistencia'

const CHAVE = 'raizes_unidade'

interface LojaEstado {
  lojaAtiva: Unidade | null
}

type LojaAcao = { tipo: 'SELECIONAR'; loja: Unidade | null }

function lojaReducer(estado: LojaEstado, acao: LojaAcao): LojaEstado {
  switch (acao.tipo) {
    case 'SELECIONAR':
      return { lojaAtiva: acao.loja }
    default:
      return estado
  }
}

// Hidratação síncrona no mount via init function do useReducer. Antes era um
// useEffect separado, mas como effects do filho rodam ANTES dos do pai, o
// TotemLayout chegava a setar U01 e logo em seguida esse hidratar sobrescrevia
// pra null — travando o totem no estado inicial.
function hidratar(inicial: LojaEstado): LojaEstado {
  const salvo = carregarEstado<{
    state?: { unidadeAtual?: Unidade | null }
    unidadeAtual?: Unidade | null
  }>(CHAVE, {})
  const loja = salvo.state?.unidadeAtual ?? salvo.unidadeAtual ?? null
  return loja ? { lojaAtiva: loja } : inicial
}

interface LojaContexto {
  lojaAtiva: Unidade | null
  selecionarLoja: (loja: Unidade | null) => void
}

const LojaCtx = createContext<LojaContexto | null>(null)

export function LojaProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(lojaReducer, { lojaAtiva: null }, hidratar)

  useEffect(() => {
    salvarEstado(CHAVE, { state: { unidadeAtual: estado.lojaAtiva } })
  }, [estado.lojaAtiva])

  const valor = useMemo(
    (): LojaContexto => ({
      lojaAtiva: estado.lojaAtiva,
      selecionarLoja: (loja) => dispatch({ tipo: 'SELECIONAR', loja }),
    }),
    [estado.lojaAtiva],
  )

  return <LojaCtx.Provider value={valor}>{children}</LojaCtx.Provider>
}

export function useLojaContexto(): LojaContexto {
  const ctx = useContext(LojaCtx)
  if (!ctx) throw new Error('useLojaContexto fora de LojaProvider')
  return ctx
}
