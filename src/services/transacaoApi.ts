import type { MetodoPagamento } from '@/features/pedidos/types'

export interface DadosCartao {
  numero: string
  nome?: string
  validade?: string
  cvv?: string
}

export interface DadosPix {
  cpf?: string
}

export interface DadosVR {
  operadora?: string
}

export type DadosTransacao =
  | DadosCartao
  | DadosPix
  | DadosVR
  | undefined

export type ResultadoTransacao =
  | { status: 'aprovado'; transacaoId: string; metodo: MetodoPagamento }
  | { status: 'recusado'; motivo: string }
  | { status: 'erro'; mensagem: string }

const CARTAO_RECUSADO = '5555444433331111'
const CARTAO_ERRO = '5555444433332222'

function normalizarCartao(numero?: string): string {
  return (numero ?? '').replace(/\s|-/g, '')
}

function aleatorioEntre(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export async function processarTransacaoExterna(
  metodo: MetodoPagamento,
  dados: DadosTransacao = undefined,
): Promise<ResultadoTransacao> {
  const latencia = aleatorioEntre(2000, 4000)
  await new Promise((r) => setTimeout(r, latencia))

  if (metodo === 'credito' || metodo === 'debito') {
    const numero = normalizarCartao((dados as DadosCartao | undefined)?.numero)
    if (numero === CARTAO_RECUSADO) {
      return {
        status: 'recusado',
        motivo:
          'Transação recusada pelo emissor. Verifique limite ou contate seu banco.',
      }
    }
    if (numero === CARTAO_ERRO) {
      return {
        status: 'erro',
        mensagem:
          'Instabilidade na comunicação com o adquirente. Aguarde e tente de novo.',
      }
    }
  }

  if (metodo === 'pix') {
    return {
      status: 'aprovado',
      metodo,
      transacaoId: `pix_${Date.now()}`,
    }
  }

  if (Math.random() < 0.9) {
    return {
      status: 'aprovado',
      metodo,
      transacaoId: `${metodo}_${Date.now()}`,
    }
  }
  return {
    status: 'recusado',
    motivo: 'Autorização negada pelo meio de pagamento.',
  }
}
