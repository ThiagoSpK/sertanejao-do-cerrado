import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { processarTransacaoExterna } from '@/services/transacaoApi'

describe('transacaoApi.processarTransacaoExterna', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('TC09 — PIX sempre aprova e devolve transacaoId com prefixo correto', async () => {
    const promessa = processarTransacaoExterna('pix')
    await vi.advanceTimersByTimeAsync(5000)
    const r = await promessa

    expect(r.status).toBe('aprovado')
    if (r.status === 'aprovado') {
      expect(r.metodo).toBe('pix')
      expect(r.transacaoId).toMatch(/^pix_\d+$/)
    }
  })

  it('TC10 — cartão 5555…1111 recusa citando o emissor', async () => {
    const promessa = processarTransacaoExterna('credito', {
      numero: '5555 4444 3333 1111',
    })
    await vi.advanceTimersByTimeAsync(5000)
    const r = await promessa

    expect(r.status).toBe('recusado')
    if (r.status === 'recusado') {
      expect(r.motivo.toLowerCase()).toMatch(/emissor|limite/)
    }
  })

  it('TC11 — cartão 5555…2222 dispara erro de comunicação com adquirente', async () => {
    const promessa = processarTransacaoExterna('credito', {
      numero: '5555-4444-3333-2222',
    })
    await vi.advanceTimersByTimeAsync(5000)
    const r = await promessa

    expect(r.status).toBe('erro')
    if (r.status === 'erro') {
      expect(r.mensagem.toLowerCase()).toMatch(/adquirente|comunicação|instabilidade/)
    }
  })

  it('cartão de débito com número fora dos de teste cai no branch determinístico quando random < 0.9', async () => {
    // mock pra branch aprovado (Math.random < 0.9)
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const promessa = processarTransacaoExterna('debito', {
      numero: '5555 1234 5678 9999',
    })
    await vi.advanceTimersByTimeAsync(5000)
    const r = await promessa

    expect(r.status).toBe('aprovado')
    if (r.status === 'aprovado') {
      expect(r.metodo).toBe('debito')
    }
  })
})
