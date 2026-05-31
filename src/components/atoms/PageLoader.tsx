import { Loader2 } from 'lucide-react'

interface Props {
  mensagem?: string
}

export function PageLoader({ mensagem = 'Carregando…' }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-screen place-items-center bg-background px-6 py-12"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">{mensagem}</p>
      </div>
    </div>
  )
}
