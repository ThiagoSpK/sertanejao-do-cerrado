import { useLojaAtiva, useSacola } from '@/hooks'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { Pedido } from '@/features/pedidos/types'

interface EstadoConfirmacao {
  pedido: Pedido
  produtosFora: number
}

export interface UsePedirDeNovoReturn {
  /** Solicita repetir o pedido. Pode abrir confirmação ou navegar direto. */
  pedirDeNovo: (pedido: Pedido) => void
  /** Estado da confirmação (mostrar dialog). */
  confirmacao: EstadoConfirmacao | null
  /** Limpar confirmação sem fazer nada. */
  cancelar: () => void
  /** Substituir carrinho atual pelos itens do pedido. */
  confirmarSubstituir: () => void
  /** Adicionar itens do pedido ao que já está no carrinho. */
  confirmarAdicionar: () => void
}

export function usePedirDeNovo(): UsePedirDeNovoReturn {
  const navigate = useNavigate()
  const itensCarrinho = useSacola().itens
  const adicionar = useSacola().adicionarItem
  const limpar = useSacola().esvaziarSacola
  const unidadeAtual = useLojaAtiva().lojaAtiva

  const [confirmacao, setConfirmacao] = useState<EstadoConfirmacao | null>(null)

  function repor(pedido: Pedido) {
    let foraDaUnidade = 0
    pedido.itens.forEach((item) => {
      if (unidadeAtual && !item.produto.unidades.includes(unidadeAtual.id)) {
        foraDaUnidade += 1
        return
      }
      adicionar(
        item.produto,
        item.quantidade,
        item.selecoes,
        item.observacoes,
      )
    })

    if (foraDaUnidade === pedido.itens.length) {
      toast.error(
        'Nenhum item desse pedido está disponível na sua unidade atual.',
        {
          description: unidadeAtual
            ? `Tente trocar de unidade.`
            : 'Selecione uma unidade primeiro.',
        },
      )
      return
    }

    if (foraDaUnidade > 0) {
      toast.warning(
        `${foraDaUnidade} ${foraDaUnidade === 1 ? 'item está indisponível' : 'itens estão indisponíveis'} na sua unidade.`,
        { description: 'Adicionamos só o que dá pra preparar aqui.' },
      )
    } else {
      toast.success('Itens adicionados ao carrinho.', {
        description: `Pedido #${pedido.numero} repetido.`,
      })
    }

    navigate('/carrinho')
  }

  function pedirDeNovo(pedido: Pedido) {
    if (!unidadeAtual) {
      toast.error('Selecione uma unidade pra repetir o pedido.')
      navigate('/selecionar-unidade')
      return
    }

    if (itensCarrinho.length === 0) {
      repor(pedido)
      return
    }

    const fora = pedido.itens.filter(
      (item) => !item.produto.unidades.includes(unidadeAtual.id),
    ).length
    setConfirmacao({ pedido, produtosFora: fora })
  }

  function cancelar() {
    setConfirmacao(null)
  }

  function confirmarSubstituir() {
    if (!confirmacao) return
    const { pedido } = confirmacao
    limpar()
    setConfirmacao(null)
    repor(pedido)
  }

  function confirmarAdicionar() {
    if (!confirmacao) return
    const { pedido } = confirmacao
    setConfirmacao(null)
    repor(pedido)
  }

  return {
    pedirDeNovo,
    confirmacao,
    cancelar,
    confirmarSubstituir,
    confirmarAdicionar,
  }
}
