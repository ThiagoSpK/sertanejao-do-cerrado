import usuariosMock from '@/mocks/usuarios.json'
import { comLatencia } from '@/lib/latencia'
import type { PerfilCliente } from '@/features/conta/types'

interface PerfilComSenha extends PerfilCliente {
  senha: string
}

const CHAVE_CADASTRADOS = 'raizes_usuarios_cadastrados'

const MOCK = usuariosMock as PerfilComSenha[]

function lerCadastrados(): PerfilComSenha[] {
  try {
    const raw = window.localStorage.getItem(CHAVE_CADASTRADOS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function gravarCadastrados(lista: PerfilComSenha[]): void {
  window.localStorage.setItem(CHAVE_CADASTRADOS, JSON.stringify(lista))
}

function semSenha(u: PerfilComSenha): PerfilCliente {
  const { senha: _ignorada, ...resto } = u
  void _ignorada
  return resto
}

function emailIguais(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

export function emailJaCadastrado(email: string): boolean {
  if (MOCK.some((u) => emailIguais(u.email, email))) return true
  return lerCadastrados().some((u) => emailIguais(u.email, email))
}

export async function entrarComCredenciais(
  email: string,
  senha: string,
): Promise<PerfilCliente | null> {
  const todos = [...MOCK, ...lerCadastrados()]
  const encontrado = todos.find(
    (u) => emailIguais(u.email, email) && u.senha === senha,
  )
  return comLatencia(encontrado ? semSenha(encontrado) : null, 300, 300)
}

export function registrarPerfil(
  perfil: PerfilCliente,
  senha: string,
): boolean {
  if (emailJaCadastrado(perfil.email)) return false
  const cadastrados = lerCadastrados()
  cadastrados.push({ ...perfil, senha })
  gravarCadastrados(cadastrados)
  return true
}
