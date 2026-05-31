import { Link } from 'react-router-dom'
import { AlertCircle, CreditCard, Phone, RefreshCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ResultadoTransacao } from '@/services/transacaoApi'

interface Props {
  resultado: ResultadoTransacao
  onTentarOutra: () => void
}

export default function PagamentoFalha({ resultado, onTentarOutra }: Props) {
  const isErro = resultado.status === 'erro'

  const titulo = isErro
    ? 'Tivemos um problema de comunicação'
    : 'Não conseguimos concluir seu pagamento'

  const detalhe =
    resultado.status === 'recusado'
      ? resultado.motivo
      : resultado.status === 'erro'
        ? resultado.mensagem
        : ''

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-12" aria-hidden />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl text-foreground md:text-3xl">
            {titulo}
          </h1>
          <p className="text-sm text-muted-foreground">{detalhe}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 text-left shadow-sm">
          <h2 className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            O que você pode fazer
          </h2>
          <ul className="space-y-3 text-sm text-foreground">
            <li className="flex items-start gap-3">
              <RefreshCcw
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden
              />
              <span>Tentar outra forma de pagamento</span>
            </li>
            <li className="flex items-start gap-3">
              <CreditCard
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden
              />
              <span>Verificar os dados do cartão e tentar de novo</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden
              />
              <span>Entrar em contato com seu banco se persistir</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            onClick={onTentarOutra}
            className="h-12 text-sm font-bold uppercase tracking-wide"
          >
            Tentar outra forma
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 text-sm font-bold uppercase tracking-wide"
          >
            <Link to="/carrinho">Voltar ao carrinho</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Seu pedido <strong>não foi confirmado</strong>. Os itens continuam no
          seu carrinho.
        </p>
      </div>
    </main>
  )
}
