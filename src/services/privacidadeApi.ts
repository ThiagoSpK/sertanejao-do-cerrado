const CHAVES_DADOS = [
  'raizes_usuario',
  'raizes_unidade',
  'raizes_carrinho',
  'raizes_pedidos',
  'raizes_fidelidade',
  'raizes_consentimentos',
] as const

type ChaveDados = (typeof CHAVES_DADOS)[number]

type PacoteExportacao = {
  versao: string
  geradoEm: string
  fonte: 'navegador-localStorage'
  dados: Record<ChaveDados, unknown>
}

function lerJsonSeguro(chave: string): unknown {
  try {
    const raw = window.localStorage.getItem(chave)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function nomeArquivo(): string {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `raizes-exportacao-lgpd-${ts}.json`
}

export function exportarPacoteTitular(): PacoteExportacao {
  const dados = CHAVES_DADOS.reduce<Record<string, unknown>>((acc, chave) => {
    acc[chave] = lerJsonSeguro(chave)
    return acc
  }, {}) as Record<ChaveDados, unknown>

  const pacote: PacoteExportacao = {
    versao: '2.0',
    geradoEm: new Date().toISOString(),
    fonte: 'navegador-localStorage',
    dados,
  }

  const blob = new Blob([JSON.stringify(pacote, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo()
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)

  return pacote
}

export function apagarDadosTitular(): void {
  for (const chave of CHAVES_DADOS) {
    window.localStorage.removeItem(chave)
  }
  window.location.replace('/')
}
