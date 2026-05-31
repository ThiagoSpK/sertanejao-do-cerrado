import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

import type { ChaveConsentimento } from '@/features/lgpd/types'
import { carregarEstado, salvarEstado } from '@/lib/persistencia'

const CHAVE = 'raizes_consentimentos'

interface PrivacidadeEstado {
  cookiesAnaliticos: boolean
  marketing: boolean
  geolocalizacao: boolean
  perfilConsumo: boolean
  dataAtualizacao: string | null
}

type PrivacidadeAcao =
  | { tipo: 'ATUALIZAR'; chave: ChaveConsentimento; valor: boolean }
  | { tipo: 'ACEITAR_TODOS' }
  | { tipo: 'APENAS_ESSENCIAIS' }
  | { tipo: 'LIMPAR' }
  | { tipo: 'HIDRATAR'; estado: PrivacidadeEstado }

const ESSENCIAIS: Omit<PrivacidadeEstado, 'dataAtualizacao'> = {
  cookiesAnaliticos: false,
  marketing: false,
  geolocalizacao: false,
  perfilConsumo: false,
}

const TODOS: Omit<PrivacidadeEstado, 'dataAtualizacao'> = {
  cookiesAnaliticos: true,
  marketing: true,
  geolocalizacao: true,
  perfilConsumo: true,
}

function privacidadeReducer(
  estado: PrivacidadeEstado,
  acao: PrivacidadeAcao,
): PrivacidadeEstado {
  switch (acao.tipo) {
    case 'HIDRATAR':
      return acao.estado
    case 'ATUALIZAR':
      return {
        ...estado,
        [acao.chave]: acao.valor,
        dataAtualizacao: new Date().toISOString(),
      }
    case 'ACEITAR_TODOS':
      return { ...TODOS, dataAtualizacao: new Date().toISOString() }
    case 'APENAS_ESSENCIAIS':
      return { ...ESSENCIAIS, dataAtualizacao: new Date().toISOString() }
    case 'LIMPAR':
      return { ...ESSENCIAIS, dataAtualizacao: null }
    default:
      return estado
  }
}

export function titularDecidiu(estado: PrivacidadeEstado): boolean {
  return estado.dataAtualizacao !== null
}

interface PrivacidadeContexto extends PrivacidadeEstado {
  atualizarPreferencia: (chave: ChaveConsentimento, valor: boolean) => void
  aceitarTodasPreferencias: () => void
  manterApenasEssenciais: () => void
  resetarPreferencias: () => void
  decidiu: boolean
}

const PrivacidadeCtx = createContext<PrivacidadeContexto | null>(null)

export function PrivacidadeProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(privacidadeReducer, {
    ...ESSENCIAIS,
    dataAtualizacao: null,
  })

  useEffect(() => {
    const salvo = carregarEstado<{ state?: PrivacidadeEstado }>(CHAVE, {})
    const hidratado = salvo.state ?? salvo
    if (hidratado && 'cookiesAnaliticos' in hidratado) {
      dispatch({ tipo: 'HIDRATAR', estado: hidratado as PrivacidadeEstado })
    }
  }, [])

  useEffect(() => {
    salvarEstado(CHAVE, { state: estado })
  }, [estado])

  const valor = useMemo(
    (): PrivacidadeContexto => ({
      ...estado,
      decidiu: titularDecidiu(estado),
      atualizarPreferencia: (chave, valor) =>
        dispatch({ tipo: 'ATUALIZAR', chave, valor }),
      aceitarTodasPreferencias: () => dispatch({ tipo: 'ACEITAR_TODOS' }),
      manterApenasEssenciais: () => dispatch({ tipo: 'APENAS_ESSENCIAIS' }),
      resetarPreferencias: () => dispatch({ tipo: 'LIMPAR' }),
    }),
    [estado],
  )

  return (
    <PrivacidadeCtx.Provider value={valor}>{children}</PrivacidadeCtx.Provider>
  )
}

export function usePrivacidadeContexto(): PrivacidadeContexto {
  const ctx = useContext(PrivacidadeCtx)
  if (!ctx)
    throw new Error('usePrivacidadeContexto fora de PrivacidadeProvider')
  return ctx
}
