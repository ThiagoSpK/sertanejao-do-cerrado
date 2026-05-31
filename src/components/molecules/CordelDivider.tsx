import { cn } from '@/lib/utils'

interface Props {
  className?: string
  /** Cor do stroke. 'primary' usa terracota, 'ink' usa marrom. */
  cor?: 'primary' | 'ink' | 'white'
}

const STROKE: Record<NonNullable<Props['cor']>, string> = {
  primary: '%23C84B31',
  ink: '%233D2817',
  white: 'rgba(255,255,255,.35)',
}

/**
 * Divisor decorativo inspirado em literatura de cordel — assinatura visual da marca.
 * SVG repetido em background-image, dispensa imagem externa.
 */
export function CordelDivider({ className, cor = 'primary' }: Props) {
  const stroke = STROKE[cor]
  const dataUri = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 12' preserveAspectRatio='none'><path d='M0,6 L5,0 L10,6 L15,0 L20,6 L25,0 L30,6 L35,0 L40,6 L45,0 L50,6 L55,0 L60,6 L65,0 L70,6 L75,0 L80,6 L85,0 L90,6 L95,0 L100,6' fill='none' stroke='${stroke}' stroke-width='2' stroke-linejoin='miter' opacity='0.45'/></svg>`
  return (
    <div
      aria-hidden
      className={cn('h-3 w-full', className)}
      style={{
        backgroundImage: `url("${dataUri}")`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: '80px 12px',
      }}
    />
  )
}
