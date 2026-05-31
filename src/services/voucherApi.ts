import cuponsMock from '@/mocks/cupons.json'
import { comLatencia } from '@/lib/latencia'
import type { Cupom } from '@/features/carrinho/types'

const VOUCHERS = cuponsMock as Cupom[]

export type MotivoVoucherInvalido = 'inexistente' | 'inativo' | 'expirado'

export type ResultadoVoucher =
  | { valido: true; cupom: Cupom }
  | { valido: false; motivo: MotivoVoucherInvalido }

export async function validarVoucher(codigo: string): Promise<ResultadoVoucher> {
  const codigoNormalizado = codigo.trim().toUpperCase()
  const cupom = VOUCHERS.find((c) => c.codigo === codigoNormalizado)

  if (!cupom) {
    return comLatencia<ResultadoVoucher>({
      valido: false,
      motivo: 'inexistente',
    })
  }
  if (!cupom.ativo) {
    return comLatencia<ResultadoVoucher>({
      valido: false,
      motivo: 'inativo',
    })
  }

  const hoje = new Date().toISOString().slice(0, 10)
  if (cupom.validade < hoje) {
    return comLatencia<ResultadoVoucher>({
      valido: false,
      motivo: 'expirado',
    })
  }

  return comLatencia<ResultadoVoucher>({ valido: true, cupom })
}

export function valorDescontoVoucher(cupom: Cupom, subtotal: number): number {
  if (cupom.tipo === 'percentual') {
    return Math.max(0, (subtotal * cupom.valor) / 100)
  }
  return Math.min(subtotal, cupom.valor)
}
