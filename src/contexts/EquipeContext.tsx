import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

import { carregarEstado, salvarEstado } from '@/lib/persistencia'

export type PapelEquipe = 'atendente' | 'cozinha' | 'gerente'

export interface MembroEquipe {
  email: string
  nome: string
  papel: PapelEquipe
}

interface EquipeEstado {
  membro: MembroEquipe | null
}

type EquipeAcao =
  | { tipo: 'ENTRAR'; membro: MembroEquipe }
  | { tipo: 'SAIR' }
  | { tipo: 'HIDRATAR'; membro: MembroEquipe | null }

const SENHA_DEMO = 'sertao123'
const DOMINIO_VALIDO = '@sertanejao.com'

function nomeDoEmail(email: string): string {
  const local = email.split('@')[0] ?? ''
  return local
    .split('.')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

function equipeReducer(estado: EquipeEstado, acao: EquipeAcao): EquipeEstado {
  switch (acao.tipo) {
    case 'HIDRATAR':
    case 'ENTRAR':
      return { membro: acao.membro }
    case 'SAIR':
      return { membro: null }
    default:
      return estado
  }
}

export const ROTULOS_PAPEL: Record<PapelEquipe, string> = {
  atendente: 'Balcão',
  cozinha: 'Produção',
  gerente: 'Gestão',
}

interface EquipeContexto {
  membro: MembroEquipe | null
  autenticarMembro: (
    email: string,
    senha: string,
    papel: PapelEquipe,
  ) => MembroEquipe | null
  sairPainel: () => void
}

const EquipeCtx = createContext<EquipeContexto | null>(null)

const CHAVE = 'raizes_operacional'

export function EquipeProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(equipeReducer, { membro: null })

  useEffect(() => {
    const salvo = carregarEstado<{ state?: { usuario?: MembroEquipe | null } }>(
      CHAVE,
      {},
    )
    const membro =
      salvo.state?.usuario ??
      (salvo as { usuario?: MembroEquipe | null }).usuario ??
      null
    if (membro && 'role' in membro) {
      dispatch({
        tipo: 'HIDRATAR',
        membro: {
          email: (membro as { email: string }).email,
          nome: (membro as { nome: string }).nome,
          papel: (membro as { role: PapelEquipe }).role,
        },
      })
    } else if (membro && 'papel' in membro) {
      dispatch({ tipo: 'HIDRATAR', membro: membro as MembroEquipe })
    }
  }, [])

  useEffect(() => {
    const persistido = estado.membro
      ? {
          email: estado.membro.email,
          nome: estado.membro.nome,
          role: estado.membro.papel,
        }
      : null
    salvarEstado(CHAVE, { state: { usuario: persistido } })
  }, [estado.membro])

  const valor = useMemo((): EquipeContexto => {
    const autenticarMembro = (
      email: string,
      senha: string,
      papel: PapelEquipe,
    ): MembroEquipe | null => {
      const e = email.trim().toLowerCase()
      if (!e.endsWith(DOMINIO_VALIDO)) return null
      if (senha !== SENHA_DEMO) return null
      const membro: MembroEquipe = {
        email: e,
        nome: nomeDoEmail(e),
        papel,
      }
      dispatch({ tipo: 'ENTRAR', membro })
      return membro
    }

    return {
      membro: estado.membro,
      autenticarMembro,
      sairPainel: () => dispatch({ tipo: 'SAIR' }),
    }
  }, [estado.membro])

  return <EquipeCtx.Provider value={valor}>{children}</EquipeCtx.Provider>
}

export function useEquipeContexto(): EquipeContexto {
  const ctx = useContext(EquipeCtx)
  if (!ctx) throw new Error('useEquipeContexto fora de EquipeProvider')
  return ctx
}
