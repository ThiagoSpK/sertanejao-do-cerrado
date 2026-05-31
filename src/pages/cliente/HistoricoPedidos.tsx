import { useGestaoPedidos } from '@/hooks'
import { Link } from 'react-router-dom'
import {
  ChefHat,
  ChevronRight,
  Receipt,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ROTULOS_STATUS,
  type Pedido,
  type StatusPedido,
} from '@/features/pedidos/types'
import { usePedirDeNovo } from '@/features/carrinho/usePedirDeNovo'
import { DialogPedirDeNovo } from '@/features/carrinho/DialogPedirDeNovo'
import { formatarPreco } from '@/lib/formatadores'
import { cn } from '@/lib/utils'

const COR_STATUS: Record<StatusPedido, string> = {
  recebido: 'bg-secondary/40 text-secondary-foreground',
  preparo: 'bg-primary/15 text-primary',
  pronto: 'bg-feedback-success/15 text-feedback-success',
  retirado: 'bg-muted text-muted-foreground',
  cancelado: 'bg-destructive/10 text-destructive',
}

function dataCurta(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistoricoPedidos() {
  const pedidos = useGestaoPedidos().pedidos
  // O PedidosProvider hidrata o localStorage dentro de um useEffect, então no
  // primeiro render o array ainda vem vazio. `hidratado` vira true no tick
  // seguinte — antes disso, renderiza skeleton em vez de "sem pedidos".
  const hidratado = useGestaoPedidos().hidratado
  const controlador = usePedirDeNovo()

  if (!hidratado) {
    return (
      <section className="space-y-5 px-4 py-6 md:px-8">
        <header>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </header>
        <ul className="space-y-3" aria-busy>
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i}>
              <CardSkeleton />
            </li>
          ))}
        </ul>
      </section>
    )
  }

  if (pedidos.length === 0) {
    return (
      <section className="grid min-h-[60vh] place-items-center px-6 py-12 text-center">
        <div className="max-w-sm space-y-4">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="size-9" aria-hidden />
          </div>
          <h1 className="font-display text-2xl text-foreground">
            Sem pedidos por aqui ainda
          </h1>
          <p className="text-sm text-muted-foreground">
            Quando você pedir, o histórico aparece aqui pra você acompanhar e
            repetir o que mais gostou.
          </p>
          <Button asChild className="mt-2 w-full">
            <Link to="/cardapio">Ver cardápio</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-5 px-4 py-6 md:px-8">
      <header>
        <h1 className="font-display text-3xl text-foreground md:text-4xl">
          Meus pedidos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pedidos.length} pedido{pedidos.length === 1 ? '' : 's'} no histórico
        </p>
      </header>

      <ul className="space-y-3">
        {pedidos.map((p) => (
          <li key={p.id}>
            <CardPedido pedido={p} onPedirDeNovo={controlador.pedirDeNovo} />
          </li>
        ))}
      </ul>

      <DialogPedirDeNovo controlador={controlador} />
    </section>
  )
}

interface CardPedidoProps {
  pedido: Pedido
  onPedirDeNovo: (pedido: Pedido) => void
}

function CardPedido({ pedido, onPedirDeNovo }: CardPedidoProps) {
  const totalItens = pedido.itens.reduce(
    (acc, it) => acc + it.quantidade,
    0,
  )
  const Icone =
    pedido.status === 'preparo' || pedido.status === 'pronto'
      ? ChefHat
      : Receipt

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
      <Link
        to={`/pedidos/${pedido.id}`}
        className="flex items-center gap-3"
      >
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted text-primary">
          <Icone className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-foreground">
              Pedido #{pedido.numero}
            </p>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                COR_STATUS[pedido.status],
              )}
            >
              {ROTULOS_STATUS[pedido.status]}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {dataCurta(pedido.criadoEm)} · {totalItens} item
            {totalItens === 1 ? '' : 's'} · Sertanejão — {pedido.unidadeNome}
          </p>
          <p className="mt-1 text-sm text-foreground">
            {formatarPreco(pedido.total)}
          </p>
        </div>
        <ChevronRight
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Link>
      <div className="mt-3 flex justify-end border-t border-dashed border-border pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onPedirDeNovo(pedido)
          }}
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Pedir de novo
        </Button>
      </div>
    </article>
  )
}

function CardSkeleton() {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </article>
  )
}
