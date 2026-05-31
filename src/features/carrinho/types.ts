import type { OpcaoCustomizacao, Produto } from '@/features/cardapio/types'

export type TipoCupom = 'percentual' | 'fixo'

export interface Cupom {
  codigo: string
  descricao: string
  tipo: TipoCupom
  /** percentual: 0..100 · fixo: valor em reais */
  valor: number
  /** ISO date 'YYYY-MM-DD' */
  validade: string
  ativo: boolean
}

export interface ItemCarrinho {
  /** ID único do item no carrinho (uuid local), distinto do produto.id pra permitir mesmo produto com customizações diferentes. */
  itemId: string
  produto: Produto
  quantidade: number
  /** Mapa customizacaoId -> opcoes selecionadas */
  selecoes: Record<string, OpcaoCustomizacao[]>
  observacoes?: string
}
