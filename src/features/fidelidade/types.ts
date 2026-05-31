/** Níveis do programa Clube Pequi (frutos do cerrado, substitui Bronze/Prata/Ouro). */
export type NivelFidelidade = 'pequi' | 'cagaita' | 'baru'

export interface Recompensa {
  id: string
  nome: string
  descricao: string
  custoPontos: number
  imagem: string
  ativa: boolean
}

export interface MovimentacaoPontos {
  id: string
  tipo: 'credito' | 'debito'
  pontos: number
  motivo: string
  em: string
  pedidoId?: string
  recompensaId?: string
}

export const FAIXAS_NIVEL: {
  nivel: NivelFidelidade
  minPontos: number
  rotulo: string
  descricao: string
}[] = [
  {
    nivel: 'pequi',
    minPontos: 0,
    rotulo: 'Pequi',
    descricao: 'Fruto-base do cerrado — benefícios de entrada',
  },
  {
    nivel: 'cagaita',
    minPontos: 600,
    rotulo: 'Cagaita',
    descricao: 'Sabor cítrico raro — resgates ampliados',
  },
  {
    nivel: 'baru',
    minPontos: 1500,
    rotulo: 'Baru',
    descricao: 'Castanha nobre — prioridade e combos exclusivos',
  },
]

export function nivelPorPontos(pontos: number): NivelFidelidade {
  if (pontos >= 1500) return 'baru'
  if (pontos >= 600) return 'cagaita'
  return 'pequi'
}

/** 2 pontos por real + bônus de 50 em pedidos acima de R$ 50. */
export function pontosPorValorPedido(totalReais: number): number {
  const base = Math.floor(totalReais * 2)
  const bonus = totalReais > 50 ? 50 : 0
  return base + bonus
}

export function pontosParaProximoNivel(pontos: number): {
  proximo: NivelFidelidade
  faltam: number
  progresso: number
} | null {
  if (pontos >= 1500) return null
  if (pontos >= 600) {
    return {
      proximo: 'baru',
      faltam: 1500 - pontos,
      progresso: (pontos - 600) / (1500 - 600),
    }
  }
  return {
    proximo: 'cagaita',
    faltam: 600 - pontos,
    progresso: pontos / 600,
  }
}

export const VALOR_RECOMPENSA_REAIS: Record<string, number> = {
  R01: 9.0,
  R02: 14.0,
  R03: 10.0,
  R04: 16.0,
  R05: 24.0,
  R06: 18.0,
}
