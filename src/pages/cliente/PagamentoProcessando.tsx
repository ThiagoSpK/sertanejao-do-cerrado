import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ROTULOS_METODO, type MetodoPagamento } from '@/features/pedidos/types'

interface Props {
  metodo: MetodoPagamento
  /** Disponível só após 30s sem resposta — quem orquestra é o container Pagamento */
  onCancelar?: () => void
}

const FALLBACK_DELAY = 25_000

export default function PagamentoProcessando({ metodo, onCancelar }: Props) {
  const [mostrarFallback, setMostrarFallback] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setMostrarFallback(true), FALLBACK_DELAY)
    return () => window.clearTimeout(id)
  }, [])

  const mensagem =
    metodo === 'pix'
      ? 'Conectando ao banco emissor para confirmar o PIX...'
      : 'Confirmando com o seu banco...'

  return (
    <main
      role="status"
      aria-live="polite"
      className="grid min-h-[80vh] place-items-center px-6 py-12 text-center"
    >
      <div className="max-w-sm space-y-8">
        <div className="relative mx-auto grid size-40 place-items-center">
          <div className="absolute size-40 animate-ping rounded-full bg-primary/10" />
          <div className="absolute size-28 rounded-full border border-primary/30 bg-primary/5" />
          <div className="absolute size-20 rounded-full border border-primary/60 bg-primary/10" />
          <div className="relative grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
            <span
              className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl text-foreground">
            Processando pagamento…
          </h1>
          <p className="text-sm text-muted-foreground">{mensagem}</p>
          <p className="text-xs text-muted-foreground">
            Método: <strong>{ROTULOS_METODO[metodo]}</strong>
          </p>
        </div>

        <div
          className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-muted"
          aria-hidden
        >
          <div className="h-full w-1/3 animate-[shimmer_1.6s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>

        <p className="text-xs text-muted-foreground">
          Não feche o aplicativo. Isso pode levar até 30 segundos.
        </p>

        {mostrarFallback && (
          <div className="mt-4 space-y-3 rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-foreground">
              Tá demorando mais que o esperado.
            </p>
            {onCancelar && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelar}
                className="w-full"
              >
                Cancelar e tentar de novo
              </Button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </main>
  )
}
