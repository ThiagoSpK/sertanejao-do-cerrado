import { useGestaoPedidos } from '@/hooks'
import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, Receipt } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ROTULOS_METODO } from '@/features/pedidos/types'
import { formatarPreco } from '@/lib/formatadores'

export default function PagamentoSucesso() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const pedidoId = searchParams.get('pedido')
  const { obterPedido } = useGestaoPedidos()
  const pedido = pedidoId ? obterPedido(pedidoId) : undefined

  useEffect(() => {
    if (!pedidoId || !pedido) navigate('/home', { replace: true })
  }, [pedidoId, pedido, navigate])

  if (!pedido) return null

  const totalItens = pedido.itens.reduce((acc, it) => acc + it.quantidade, 0)

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 grid size-24 place-items-center">
            <div className="absolute size-24 animate-pulse rounded-full bg-feedback-success/20" />
            <div className="absolute size-20 rounded-full bg-feedback-success/30" />
            <div className="relative grid size-16 place-items-center rounded-full bg-feedback-success text-white shadow-md">
              <CheckCircle2
                className="size-9"
                aria-hidden
                strokeWidth={2.5}
              />
            </div>
          </div>
          <h1 className="font-display text-2xl text-foreground md:text-3xl">
            Pagamento aprovado!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu pedido foi recebido pela{' '}
            <strong>Sertanejão — {pedido.unidadeNome}</strong>
          </p>
        </div>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <header className="flex items-center gap-3 border-b border-dashed border-border pb-4">
            <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Pedido
              </p>
              <p className="font-display text-2xl text-foreground">
                #{pedido.numero}
              </p>
            </div>
          </header>

          <dl className="space-y-2 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Itens</dt>
              <dd className="text-foreground">
                {totalItens} {totalItens === 1 ? 'item' : 'itens'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total pago</dt>
              <dd className="font-bold text-foreground">
                {formatarPreco(pedido.total)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Método</dt>
              <dd className="text-foreground">
                {ROTULOS_METODO[pedido.metodoPagamento]}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/15 p-3 text-sm">
            <Clock className="size-4 shrink-0 text-foreground" aria-hidden />
            <span className="text-foreground">
              Tempo estimado: <strong>15-20 min</strong>
            </span>
          </div>
        </article>

        <p className="text-center text-xs italic text-muted-foreground">
          Avisaremos quando estiver pronto pra retirada.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 text-sm font-bold uppercase tracking-wide"
          >
            <Link to={`/pedidos/${pedido.id}`}>Acompanhar pedido</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="h-12 text-sm font-bold uppercase tracking-wide"
          >
            <Link to="/home">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
