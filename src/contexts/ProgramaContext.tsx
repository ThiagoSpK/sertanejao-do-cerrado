import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

import type { Cupom } from '@/features/carrinho/types'
import {
  VALOR_RECOMPENSA_REAIS,
  nivelPorPontos,
  type MovimentacaoPontos,
  type NivelFidelidade,
  type Recompensa,
} from '@/features/fidelidade/types'
import { carregarEstado, salvarEstado } from '@/lib/persistencia'
import { useSacolaContexto } from '@/contexts/SacolaContext'

const CHAVE = 'raizes_fidelidade'

interface ProgramaEstado {
  saldoPontos: number
  historico: MovimentacaoPontos[]
}

type ProgramaAcao =
  | {
      tipo: 'CREDITAR'
      pontos: number
      motivo: string
      pedidoId?: string
    }
  | {
      tipo: 'DEBITAR'
      pontos: number
      motivo: string
      recompensaId?: string
    }
  | { tipo: 'LIMPAR' }
  | { tipo: 'HIDRATAR'; estado: ProgramaEstado }

function gerarMovId(): string {
  return `mv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function programaReducer(
  estado: ProgramaEstado,
  acao: ProgramaAcao,
): ProgramaEstado {
  switch (acao.tipo) {
    case 'HIDRATAR':
      return acao.estado
    case 'CREDITAR': {
      if (acao.pontos <= 0) return estado
      const mov: MovimentacaoPontos = {
        id: gerarMovId(),
        tipo: 'credito',
        pontos: acao.pontos,
        motivo: acao.motivo,
        em: new Date().toISOString(),
        pedidoId: acao.pedidoId,
      }
      return {
        saldoPontos: estado.saldoPontos + acao.pontos,
        historico: [mov, ...estado.historico],
      }
    }
    case 'DEBITAR': {
      if (acao.pontos <= 0 || estado.saldoPontos < acao.pontos) return estado
      const mov: MovimentacaoPontos = {
        id: gerarMovId(),
        tipo: 'debito',
        pontos: acao.pontos,
        motivo: acao.motivo,
        em: new Date().toISOString(),
        recompensaId: acao.recompensaId,
      }
      return {
        saldoPontos: estado.saldoPontos - acao.pontos,
        historico: [mov, ...estado.historico],
      }
    }
    case 'LIMPAR':
      return { saldoPontos: 0, historico: [] }
    default:
      return estado
  }
}

interface ProgramaContexto {
  saldoPontos: number
  historico: MovimentacaoPontos[]
  nivelAtual: NivelFidelidade
  creditarPontos: (
    pontos: number,
    motivo: string,
    pedidoId?: string,
  ) => void
  resgatarBeneficio: (recompensa: Recompensa) => Cupom | null
  limparPrograma: () => void
}

const ProgramaCtx = createContext<ProgramaContexto | null>(null)

export function ProgramaProvider({ children }: { children: ReactNode }) {
  const { aplicarVoucher } = useSacolaContexto()
  const [estado, dispatch] = useReducer(programaReducer, {
    saldoPontos: 0,
    historico: [],
  })

  useEffect(() => {
    const salvo = carregarEstado<{ state?: ProgramaEstado }>(CHAVE, {})
    const hidratado = salvo.state ?? salvo
    if (hidratado && 'saldoPontos' in hidratado) {
      dispatch({ tipo: 'HIDRATAR', estado: hidratado as ProgramaEstado })
    }
  }, [])

  useEffect(() => {
    salvarEstado(CHAVE, { state: estado })
  }, [estado])

  const creditarPontos = useCallback(
    (pontos: number, motivo: string, pedidoId?: string) => {
      dispatch({ tipo: 'CREDITAR', pontos, motivo, pedidoId })
    },
    [],
  )

  const resgatarBeneficio = useCallback(
    (recompensa: Recompensa): Cupom | null => {
      if (estado.saldoPontos < recompensa.custoPontos) return null
      const valor = VALOR_RECOMPENSA_REAIS[recompensa.id] ?? 10
      const cupom: Cupom = {
        codigo: `CLB-${recompensa.id}`,
        descricao: `Clube Pequi: ${recompensa.nome}`,
        tipo: 'fixo',
        valor,
        validade: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        ativo: true,
      }
      dispatch({
        tipo: 'DEBITAR',
        pontos: recompensa.custoPontos,
        motivo: `Resgate: ${recompensa.nome}`,
        recompensaId: recompensa.id,
      })
      aplicarVoucher(cupom)
      return cupom
    },
    [estado.saldoPontos, aplicarVoucher],
  )

  const valor = useMemo(
    (): ProgramaContexto => ({
      saldoPontos: estado.saldoPontos,
      historico: estado.historico,
      nivelAtual: nivelPorPontos(estado.saldoPontos),
      creditarPontos,
      resgatarBeneficio,
      limparPrograma: () => dispatch({ tipo: 'LIMPAR' }),
    }),
    [estado, creditarPontos, resgatarBeneficio],
  )

  return (
    <ProgramaCtx.Provider value={valor}>{children}</ProgramaCtx.Provider>
  )
}

export function useProgramaContexto(): ProgramaContexto {
  const ctx = useContext(ProgramaCtx)
  if (!ctx) throw new Error('useProgramaContexto fora de ProgramaProvider')
  return ctx
}

/** Referência estável para creditar pontos fora de React (timers de pedido). */
let creditarPontosRef: ProgramaContexto['creditarPontos'] | null = null

export function registrarCreditoPrograma(
  fn: ProgramaContexto['creditarPontos'],
): void {
  creditarPontosRef = fn
}

export function creditarPontosExterno(
  pontos: number,
  motivo: string,
  pedidoId?: string,
): void {
  creditarPontosRef?.(pontos, motivo, pedidoId)
}

export function ProgramaBridge() {
  const { creditarPontos } = useProgramaContexto()
  useEffect(() => {
    registrarCreditoPrograma(creditarPontos)
  }, [creditarPontos])
  return null
}
