/** Escapa um campo CSV — aspas duplas duplicadas, envolve em "" se contém vírgula/aspas/quebra. */
function escapar(valor: unknown): string {
  const s = valor == null ? '' : String(valor)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/** Monta CSV a partir de cabeçalho e linhas. UTF-8 com BOM pra abrir bonito no Excel BR. */
export function montarCsv(
  cabecalho: string[],
  linhas: (string | number | null | undefined)[][],
): string {
  const linhasCsv = [cabecalho, ...linhas]
    .map((linha) => linha.map(escapar).join(';'))
    .join('\r\n')
  return '﻿' + linhasCsv
}

/** Dispara download de um CSV no browser. */
export function baixarCsv(nome: string, conteudo: string): void {
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome.endsWith('.csv') ? nome : `${nome}.csv`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
