/** Leitura/gravação tipada em localStorage para os contextos da aplicação. */
export function carregarEstado<T>(chave: string, padrao: T): T {
  if (typeof window === 'undefined') return padrao
  try {
    const raw = window.localStorage.getItem(chave)
    if (!raw) return padrao
    return JSON.parse(raw) as T
  } catch {
    return padrao
  }
}

export function salvarEstado(chave: string, estado: unknown): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(chave, JSON.stringify(estado))
}
