import unidadesMock from '@/mocks/unidades.json'
import { comLatencia } from '@/lib/latencia'
import type { Unidade } from '@/features/unidades/types'

const LOJAS = unidadesMock as Unidade[]

export async function listarLojas(): Promise<Unidade[]> {
  return comLatencia(LOJAS)
}

export async function obterLoja(lojaId: string): Promise<Unidade | null> {
  const loja = LOJAS.find((u) => u.id === lojaId) ?? null
  return comLatencia(loja)
}

export function calcularDistanciaKm(
  origem: { lat: number; lng: number },
  destino: { lat: number; lng: number },
): number {
  const R = 6371
  const toRad = (g: number) => (g * Math.PI) / 180
  const dLat = toRad(destino.lat - origem.lat)
  const dLng = toRad(destino.lng - origem.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(origem.lat)) *
      Math.cos(toRad(destino.lat)) *
      Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
