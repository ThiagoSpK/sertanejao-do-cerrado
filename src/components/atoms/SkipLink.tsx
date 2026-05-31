interface Props {
  href?: string
  children?: React.ReactNode
}

/**
 * Link visualmente escondido até receber foco via teclado. Permite ao usuário
 * pular header/sidebar e ir direto pro conteúdo principal — requisito do WCAG
 * 2.1 (Operável > Bypass Blocks).
 */
export function SkipLink({
  href = '#main-content',
  children = 'Pular para o conteúdo',
}: Props) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {children}
    </a>
  )
}
