import recompensasMock from '@/mocks/recompensas.json'
import { comLatencia } from '@/lib/latencia'
import type { Recompensa } from '@/features/fidelidade/types'

const CATALOGO = recompensasMock as Recompensa[]

export async function listarBeneficiosPrograma(
  somenteAtivos = true,
): Promise<Recompensa[]> {
  const lista = somenteAtivos
    ? CATALOGO.filter((r) => r.ativa)
    : CATALOGO
  return comLatencia(lista)
}
