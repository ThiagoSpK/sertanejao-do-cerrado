import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

import type { PerfilCliente } from '@/features/conta/types'
import { carregarEstado, salvarEstado } from '@/lib/persistencia'

const CHAVE = 'raizes_usuario'

interface SessaoEstado {
  perfil: PerfilCliente | null
}

type SessaoAcao =
  | { tipo: 'DEFINIR'; perfil: PerfilCliente | null }
  | { tipo: 'SAIR' }
  | { tipo: 'HIDRATAR'; perfil: PerfilCliente | null }

function sessaoReducer(estado: SessaoEstado, acao: SessaoAcao): SessaoEstado {
  switch (acao.tipo) {
    case 'HIDRATAR':
    case 'DEFINIR':
      return { perfil: acao.perfil }
    case 'SAIR':
      return { perfil: null }
    default:
      return estado
  }
}

interface SessaoContexto {
  perfil: PerfilCliente | null
  definirPerfil: (perfil: PerfilCliente | null) => void
  encerrarSessao: () => void
}

const SessaoCtx = createContext<SessaoContexto | null>(null)

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(sessaoReducer, { perfil: null })

  useEffect(() => {
    const salvo = carregarEstado<{ state?: { usuario?: PerfilCliente | null } }>(
      CHAVE,
      {},
    )
    const perfil =
      salvo.state?.usuario ?? (salvo as { usuario?: PerfilCliente | null }).usuario ?? null
    dispatch({ tipo: 'HIDRATAR', perfil })
  }, [])

  useEffect(() => {
    salvarEstado(CHAVE, { state: { usuario: estado.perfil } })
  }, [estado.perfil])

  const valor = useMemo(
    (): SessaoContexto => ({
      perfil: estado.perfil,
      definirPerfil: (perfil) => dispatch({ tipo: 'DEFINIR', perfil }),
      encerrarSessao: () => dispatch({ tipo: 'SAIR' }),
    }),
    [estado.perfil],
  )

  return <SessaoCtx.Provider value={valor}>{children}</SessaoCtx.Provider>
}

export function useSessaoContexto(): SessaoContexto {
  const ctx = useContext(SessaoCtx)
  if (!ctx) throw new Error('useSessaoContexto fora de SessaoProvider')
  return ctx
}
