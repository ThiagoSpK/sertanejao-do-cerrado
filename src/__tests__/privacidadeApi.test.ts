import { describe, it, expect } from 'vitest'

import { exportarPacoteTitular } from '@/services/privacidadeApi'

describe('privacidadeApi.exportarPacoteTitular', () => {
  it('TC16 — empacota as 6 chaves raizes_* preservando JSON quando existe', () => {
    window.localStorage.setItem(
      'raizes_usuario',
      JSON.stringify({ nome: 'Maria Teste', email: 'maria@teste.com' }),
    )
    window.localStorage.setItem(
      'raizes_fidelidade',
      JSON.stringify({ state: { saldoPontos: 420 } }),
    )

    const pacote = exportarPacoteTitular()

    expect(pacote.versao).toBe('2.0')
    expect(pacote.fonte).toBe('navegador-localStorage')
    expect(Object.keys(pacote.dados).sort()).toEqual(
      [
        'raizes_carrinho',
        'raizes_consentimentos',
        'raizes_fidelidade',
        'raizes_pedidos',
        'raizes_unidade',
        'raizes_usuario',
      ].sort(),
    )

    expect(pacote.dados.raizes_usuario).toEqual({
      nome: 'Maria Teste',
      email: 'maria@teste.com',
    })
    expect(pacote.dados.raizes_unidade).toBeNull()
    expect(pacote.dados.raizes_carrinho).toBeNull()

    // formato ISO 8601 (validação por shape, não valor exato)
    expect(pacote.geradoEm).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
    )
  })

  it('chaves com JSON corrompido caem em null sem propagar erro', () => {
    window.localStorage.setItem('raizes_pedidos', '{json invalido')

    const pacote = exportarPacoteTitular()

    expect(pacote.dados.raizes_pedidos).toBeNull()
  })
})
