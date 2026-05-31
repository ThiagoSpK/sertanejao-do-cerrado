import type { Cupom, ItemCarrinho } from '@/features/carrinho/types'

export type StatusPedido =
  | 'recebido'
  | 'preparo'
  | 'pronto'
  | 'retirado'
  | 'cancelado'

export type ModoRetirada = 'balcao' | 'mesa'

export type MetodoPagamento = 'pix' | 'credito' | 'debito' | 'vr'

export type CanalPedido = 'app' | 'totem' | 'pdv'

export const ROTULOS_CANAL: Record<CanalPedido, string> = {
  app: 'App / Web',
  totem: 'Totem',
  pdv: 'PDV — balcão',
}

export interface EventoStatus {
  status: StatusPedido
  em: string
}

export interface Pedido {
  /** ID interno único (uuid local) */
  id: string
  /** Número exibido ao cliente, 4 dígitos pra caber no displaykey impresso da senha */
  numero: string
  unidadeId: string
  unidadeNome: string
  itens: ItemCarrinho[]
  cupom: Cupom | null
  subtotal: number
  desconto: number
  total: number
  metodoPagamento: MetodoPagamento
  modoRetirada: ModoRetirada
  canal: CanalPedido
  cpfCliente?: string
  status: StatusPedido
  /** Histórico imutável de transições */
  historico: EventoStatus[]
  /** ISO 8601 — quando o pedido foi confirmado pelo gateway */
  criadoEm: string
  /** Token devolvido pelo gateway simulado */
  transacaoId: string
}

export const ROTULOS_STATUS: Record<StatusPedido, string> = {
  recebido: 'Recebido',
  preparo: 'Em preparo',
  pronto: 'Pronto para retirada',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
}

export const ROTULOS_METODO: Record<MetodoPagamento, string> = {
  pix: 'PIX',
  credito: 'Cartão de crédito',
  debito: 'Cartão de débito',
  vr: 'Vale-refeição',
}

export const ROTULOS_MODO: Record<ModoRetirada, string> = {
  balcao: 'Retirada no balcão',
  mesa: 'Consumo no local',
}
