import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'

import { SacolaProvider } from '@/contexts/SacolaContext'
import {
  ProgramaProvider,
  useProgramaContexto,
} from '@/contexts/ProgramaContext'
import type { Cupom } from '@/features/carrinho/types'
import type { Recompensa } from '@/features/fidelidade/types'

// ProgramaContext usa useSacolaContexto pra chamar aplicarVoucher após resgate,
// então o wrapper precisa expor os dois providers nessa ordem.
function Wrapper({ children }: { children: ReactNode }) {
  return (
    <SacolaProvider>
      <ProgramaProvider>{children}</ProgramaProvider>
    </SacolaProvider>
  )
}

const RECOMPENSA_CAFE: Recompensa = {
  id: 'R01',
  nome: 'Café 200ml grátis',
  descricao: 'Café cortesia 200ml na próxima visita',
  custoPontos: 200,
  imagem: '/img/cafe.jpg',
  ativa: true,
}

describe('ProgramaContext', () => {
  it('TC13 — creditar pontos atualiza saldo, nível e histórico', () => {
    const { result } = renderHook(() => useProgramaContexto(), {
      wrapper: Wrapper,
    })

    expect(result.current.saldoPontos).toBe(0)
    expect(result.current.nivelAtual).toBe('pequi')

    act(() => {
      result.current.creditarPontos(700, 'Pedido teste #p001', 'p001')
    })

    expect(result.current.saldoPontos).toBe(700)
    expect(result.current.nivelAtual).toBe('cagaita')
    expect(result.current.historico).toHaveLength(1)
    expect(result.current.historico[0].tipo).toBe('credito')
    expect(result.current.historico[0].pontos).toBe(700)
  })

  it('TC14 — resgate sem saldo retorna null e preserva o saldo atual', () => {
    const { result } = renderHook(() => useProgramaContexto(), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.creditarPontos(50, 'Pedido pequeno', 'p002')
    })

    let cupomResgatado: ReturnType<
      typeof result.current.resgatarBeneficio
    > = null
    act(() => {
      cupomResgatado = result.current.resgatarBeneficio(RECOMPENSA_CAFE)
    })

    expect(cupomResgatado).toBeNull()
    expect(result.current.saldoPontos).toBe(50)
    expect(result.current.historico).toHaveLength(1) // só o crédito original
  })

  it('resgate com saldo suficiente debita pontos e devolve cupom válido', () => {
    const { result } = renderHook(() => useProgramaContexto(), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.creditarPontos(500, 'Pedido grande', 'p003')
    })

    let cupom: Cupom | null = null
    act(() => {
      cupom = result.current.resgatarBeneficio(RECOMPENSA_CAFE)
    })

    // toMatchObject não exige type narrow após o expect — TS strict não estreita
    // `cupom` mutado dentro de callback do act, daí usamos uma asserção que
    // aceita o shape diretamente.
    expect(cupom).toMatchObject({ codigo: 'CLB-R01', tipo: 'fixo' })
    expect(result.current.saldoPontos).toBe(300) // 500 - 200
    expect(result.current.historico).toHaveLength(2) // crédito + débito
    expect(result.current.historico[0].tipo).toBe('debito')
  })
})
