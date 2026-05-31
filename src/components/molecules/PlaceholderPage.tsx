import { useLocation } from 'react-router-dom'

interface Props {
  titulo: string
  subtitulo?: string
  contexto?: 'cliente' | 'totem' | 'admin'
}

const ROTULO_CONTEXTO: Record<NonNullable<Props['contexto']>, string> = {
  cliente: 'Cliente',
  totem: 'Totem',
  admin: 'Admin',
}

export function PlaceholderPage({ titulo, subtitulo, contexto }: Props) {
  const { pathname } = useLocation()
  return (
    <section className="space-y-3 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {contexto && (
          <span className="rounded-full bg-secondary/40 px-2.5 py-0.5 text-secondary-foreground">
            {ROTULO_CONTEXTO[contexto]}
          </span>
        )}
        <code className="font-mono text-[11px] normal-case tracking-normal">
          {pathname}
        </code>
      </div>
      <h1 className="font-display text-3xl text-foreground">{titulo}</h1>
      {subtitulo && (
        <p className="max-w-prose text-sm text-muted-foreground">{subtitulo}</p>
      )}
      <p className="pt-4 text-xs italic text-muted-foreground">
        Placeholder — tela ainda não implementada.
      </p>
    </section>
  )
}
