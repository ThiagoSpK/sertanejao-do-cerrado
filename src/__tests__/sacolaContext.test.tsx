import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { ReactNode } from 'react'

import { SacolaProvider, useSacolaContexto } from '@/contexts/SacolaContext'
import type { Produto } from '@/features/cardapio/types'
import type { Cupom } from '@/features/carrinho/types'

const PRODUTO_BASE: Produto = {
  id: 'p-test-001',
  nome: 'Tapioca de queijo coalho',
  descricao: 'Massa de tapioca com queijo coalho derretido',
  preco: 12,
  categoria: 'tapiocas',
  imagem: '/img/tapioca-queijo.jpg',
  tags: ['mais-pedido', 'salgado'],
  unidades: ['U01', 'U02'],
  alergenicos: ['leite'],
}

const VOUCHER_10PCT: Cupom = {
  codigo: 'TESTE10',
  descricao: 'Cupom de teste — 10%',
  tipo: 'percentual',
  valor: 10,
  validade: '2099-12-31',
  ativo: true,
}

function Wrapper({ children }: { children: ReactNode }) {
  return <SacolaProvider>{children}</SacolaProvider>
}

describe('SacolaContext', () => {
  it('TC05 — adicionar produto registra item e atualiza totais', () => {
    const { result } = renderHook(() => useSacolaContexto(), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.adicionarItem(PRODUTO_BASE, 2, {})
    })

    expect(result.current.itens).toHaveLength(1)
    expect(result.current.itens[0].quantidade).toBe(2)
    expect(result.current.totais.subtotal).toBe(24)
    expect(result.current.totais.qtdItens).toBe(2)
    expect(result.current.totais.total).toBe(24)
  })

  it('agrupa quantidade quando o mesmo produto é adicionado com seleções iguais', () => {
    const { result } = renderHook(() => useSacolaContexto(), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.adicionarItem(PRODUTO_BASE, 1, {})
    })
    act(() => {
      result.current.adicionarItem(PRODUTO_BASE, 3, {})
    })

    expect(result.current.itens).toHaveLength(1)
    expect(result.current.itens[0].quantidade).toBe(4)
    expect(result.current.totais.qtdItens).toBe(4)
  })

  it('alterar quantidade para 0 remove o item da sacola', () => {
    const { result } = renderHook(() => useSacolaContexto(), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.adicionarItem(PRODUTO_BASE, 2, {})
    })
    const itemId = result.current.itens[0].itemId

    act(() => {
      result.current.alterarQuantidade(itemId, 0)
    })

    expect(result.current.itens).toHaveLength(0)
    expect(result.current.totais.qtdItens).toBe(0)
  })

  it('TC07 — voucher percentual abate o subtotal no total', () => {
    const { result } = renderHook(() => useSacolaContexto(), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.adicionarItem(PRODUTO_BASE, 5, {})
    })
    act(() => {
      result.current.aplicarVoucher(VOUCHER_10PCT)
    })

    expect(result.current.totais.subtotal).toBe(60)
    expect(result.current.totais.desconto).toBe(6)
    expect(result.current.totais.total).toBe(54)
  })
})
