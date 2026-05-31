import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  emailJaCadastrado,
  entrarComCredenciais,
  registrarPerfil,
} from '@/services/sessaoApi'
import type { PerfilCliente } from '@/features/conta/types'

describe('sessaoApi', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('TC01 — entrar com credenciais válidas devolve perfil sem o campo senha', async () => {
    const promessa = entrarComCredenciais('beatriz@cerrado.demo', 'cerrado123')
    await vi.advanceTimersByTimeAsync(500)
    const perfil = await promessa

    expect(perfil).not.toBeNull()
    expect(perfil?.email).toBe('beatriz@cerrado.demo')
    expect(perfil?.nome).toBe('Beatriz Carvalho')
    expect((perfil as unknown as { senha?: string }).senha).toBeUndefined()
  })

  it('TC02 — entrar com senha errada devolve null sem revelar qual campo falhou', async () => {
    const promessa = entrarComCredenciais('beatriz@cerrado.demo', 'senha-errada')
    await vi.advanceTimersByTimeAsync(500)
    const perfil = await promessa

    expect(perfil).toBeNull()
  })

  it('TC03 — cadastro com e-mail já existente no mock é rejeitado', () => {
    const novo: PerfilCliente = {
      id: 'u-novo-teste',
      nome: 'Outro Usuário',
      email: 'beatriz@cerrado.demo',
      consentimentos: { marketing: false, analisePerfil: false },
      criadoEm: '2026-05-30T12:00:00.000Z',
    }

    expect(emailJaCadastrado('beatriz@cerrado.demo')).toBe(true)
    expect(registrarPerfil(novo, 'qualquer')).toBe(false)
  })

  it('cadastro novo e tentativa de re-cadastro do mesmo e-mail', () => {
    const novo: PerfilCliente = {
      id: 'u-virtual',
      nome: 'Cliente Novo',
      email: 'novo@exemplo.com',
      consentimentos: { marketing: true, analisePerfil: false },
      criadoEm: '2026-05-30T12:00:00.000Z',
    }

    expect(emailJaCadastrado('novo@exemplo.com')).toBe(false)
    expect(registrarPerfil(novo, 'senha-segura')).toBe(true)
    expect(emailJaCadastrado('novo@exemplo.com')).toBe(true)
    expect(registrarPerfil(novo, 'outra-senha')).toBe(false)
  })
})
