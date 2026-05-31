import { precoLinhaSacola, useGestaoPedidos } from '@/hooks'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ChefHat,
  CircleDot,
  Hand,
  HandCoins,
  Phone,
  Receipt,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  ROTULOS_METODO,
  ROTULOS_MODO,
  ROTULOS_STATUS,
  type EventoStatus,
  type Pedido,
  type StatusPedido,
} from '@/features/pedidos/types'
import { usePedirDeNovo } from '@/features/carrinho/usePedirDeNovo'
import { DialogPedirDeNovo } from '@/features/carrinho/DialogPedirDeNovo'
import { formatarPreco } from '@/lib/formatadores'
import { cn } from '@/lib/utils'

const ORDEM: StatusPedido[] = ['recebido', 'preparo', 'pronto', 'retirado']

function indiceStatus(s: StatusPedido): number {
  return ORDEM.indexOf(s)
}

function horaDe(eventos: EventoStatus[], status: StatusPedido): string | null {
  const e = eventos.find((x) => x.status === status)
  if (!e) return null
  return new Date(e.em).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function tituloAtual(status: StatusPedido, numero: string): string {
  switch (status) {
    case 'recebido':
      return 'Pedido recebido'
    case 'preparo':
      return 'Seu pedido está em preparo'
    case 'pronto':
      return 'Seu pedido está pronto!'
    case 'retirado':
      return 'Pedido retirado'
    case 'cancelado':
      return `Pedido #${numero} cancelado`
  }
}

function dicaTempo(status: StatusPedido): string {
  switch (status) {
    case 'recebido':
      return 'Confirmando com a cozinha — em alguns segundos começa o preparo'
    case 'preparo':
      return 'Pronto em ~12 min'
    case 'pronto':
      return 'Vá até o balcão e mostre seu número'
    case 'retirado':
      return 'Obrigado pela visita!'
    case 'cancelado':
      return 'Em caso de dúvida, fale com a unidade'
  }
}

export default function Acompanhamento() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { obterPedido } = useGestaoPedidos()
  const pedido = id ? obterPedido(id) : undefined
  const atualizarStatus = useGestaoPedidos().atualizarStatusPedido
  const controlador = usePedirDeNovo()

  useEffect(() => {
    if (!id || !pedido) navigate('/pedidos', { replace: true })
  }, [id, pedido, navigate])

  if (!pedido) return null

  const totalItens = pedido.itens.reduce((acc, it) => acc + it.quantidade, 0)
  const pontosACreditar = Math.floor(pedido.total)
  const podeRetirar = pedido.status === 'pronto'

  return (
    <section className="px-4 py-6 pb-12 md:px-8">
      <header className="mb-5 flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link to="/pedidos">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="font-display text-xl text-foreground">
          Pedido #{pedido.numero}
        </h1>
      </header>

      <CartaoStatusAtual pedido={pedido} />

      <Timeline pedido={pedido} />

      <ResumoPedido pedido={pedido} totalItens={totalItens} />

      <div className="mt-6 flex flex-col gap-3">
        {podeRetirar && (
          <Button
            size="lg"
            className="h-12 text-sm font-bold uppercase tracking-wide"
            onClick={() => {
              atualizarStatus(pedido.id, 'retirado')
              toast.success(
                `+${pontosACreditar} pontos creditados na sua fidelidade`,
                { description: `Pedido #${pedido.numero} concluído.` },
              )
            }}
          >
            <HandCoins className="size-4" aria-hidden />
            Marcar como retirado · +{pontosACreditar} pts
          </Button>
        )}
        <Button asChild variant="outline" size="lg" className="h-12">
          <a href={`tel:${pedido.unidadeNome}`} aria-label="Falar com a unidade">
            <Phone className="size-4" aria-hidden />
            Falar com a unidade
          </a>
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="h-12"
          onClick={() => controlador.pedirDeNovo(pedido)}
        >
          <RotateCcw className="size-4" aria-hidden />
          Pedir de novo
        </Button>
      </div>

      <p className="mt-4 px-2 text-center text-xs italic text-muted-foreground">
        Você recebe um aviso quando o pedido fica pronto. Mantenha o app aberto
        pra ver mudanças em tempo real.
      </p>

      <DialogPedirDeNovo controlador={controlador} />
    </section>
  )
}

function CartaoStatusAtual({ pedido }: { pedido: Pedido }) {
  const Icone =
    pedido.status === 'recebido'
      ? Receipt
      : pedido.status === 'preparo'
        ? ChefHat
        : pedido.status === 'pronto'
          ? Hand
          : pedido.status === 'retirado'
            ? Check
            : CircleDot

  return (
    <article
      role="status"
      aria-live="polite"
      className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div
        className={cn(
          'grid size-12 shrink-0 place-items-center rounded-full',
          pedido.status === 'pronto'
            ? 'bg-feedback-success/15 text-feedback-success'
            : pedido.status === 'cancelado'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary',
        )}
      >
        <Icone className="size-6" aria-hidden />
      </div>
      <div>
        <h2 className="font-display text-lg text-foreground">
          {tituloAtual(pedido.status, pedido.numero)}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {dicaTempo(pedido.status)}
        </p>
      </div>
    </article>
  )
}

function Timeline({ pedido }: { pedido: Pedido }) {
  const idxAtual = indiceStatus(pedido.status)
  const isCancelado = pedido.status === 'cancelado'

  return (
    <ol className="relative my-8 space-y-7 pl-6" aria-label="Linha do tempo">
      {ORDEM.map((s, i) => {
        const concluido = !isCancelado && i < idxAtual
        const ativo = !isCancelado && i === idxAtual
        const hora = horaDe(pedido.historico, s)
        return (
          <li key={s} className="relative flex items-center gap-4">
            {/* Linha conectora */}
            {i < ORDEM.length - 1 && (
              <span
                className={cn(
                  'absolute left-2 top-6 h-9 w-0.5',
                  concluido ? 'bg-primary' : 'bg-border',
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                'relative grid size-5 shrink-0 place-items-center rounded-full ring-4 ring-background',
                concluido && 'bg-primary',
                ativo && 'border-2 border-primary bg-card',
                !concluido && !ativo && 'border-2 border-border bg-card',
              )}
            >
              {concluido && (
                <Check
                  className="size-3 text-primary-foreground"
                  aria-hidden
                  strokeWidth={3}
                />
              )}
              {ativo && (
                <span className="size-2 animate-pulse rounded-full bg-primary" />
              )}
            </span>
            <div>
              <p
                className={cn(
                  'text-sm font-bold',
                  ativo
                    ? 'text-primary'
                    : concluido
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                )}
              >
                {ROTULOS_STATUS[s]}
              </p>
              {hora && (
                <p className="text-xs text-muted-foreground">{hora}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function ResumoPedido({
  pedido,
  totalItens,
}: {
  pedido: Pedido
  totalItens: number
}) {
  return (
    <section
      aria-labelledby="resumo-titulo"
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <h3
        id="resumo-titulo"
        className="mb-3 font-display text-lg text-foreground"
      >
        Resumo do pedido
      </h3>

      <ul className="mb-4 space-y-2 border-b border-dashed border-border pb-3">
        {pedido.itens.map((it) => (
          <li key={it.itemId} className="flex justify-between gap-2 text-sm">
            <div className="min-w-0">
              <p className="text-foreground">
                {it.quantidade}× {it.produto.nome}
              </p>
              {Object.values(it.selecoes).flat().length > 0 && (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {Object.values(it.selecoes)
                    .flat()
                    .map((o) => o.nome)
                    .join(' · ')}
                </p>
              )}
            </div>
            <span className="shrink-0 text-foreground">
              {formatarPreco(precoLinhaSacola(it) * it.quantidade)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Itens</dt>
          <dd className="text-foreground">
            {totalItens} {totalItens === 1 ? 'item' : 'itens'}
          </dd>
        </div>
        {pedido.cupom && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Cupom</dt>
            <dd className="text-primary">−{formatarPreco(pedido.desconto)} ({pedido.cupom.codigo})</dd>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <dt className="text-foreground">Total</dt>
          <dd className="text-foreground">{formatarPreco(pedido.total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Método</dt>
          <dd className="text-foreground">
            {ROTULOS_METODO[pedido.metodoPagamento]}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Modo</dt>
          <dd className="text-foreground">
            {ROTULOS_MODO[pedido.modoRetirada]}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Unidade</dt>
          <dd className="text-right text-foreground">
            Sertanejão — {pedido.unidadeNome}
          </dd>
        </div>
      </dl>
    </section>
  )
}
