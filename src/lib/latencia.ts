const MIN_MS = 300
const MAX_MS = 1500

/**
 * Embrulha um valor em uma Promise resolvida após latência aleatória entre `min` e `max` ms.
 * Substitui a chamada de rede real enquanto o backend não existe.
 */
export function comLatencia<T>(valor: T, min = MIN_MS, max = MAX_MS): Promise<T> {
  const delay = Math.random() * (max - min) + min
  return new Promise((resolve) => setTimeout(() => resolve(valor), delay))
}
