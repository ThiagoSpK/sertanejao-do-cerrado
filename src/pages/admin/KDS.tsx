import { precoLinhaSacola, useGestaoPedidos } from '@/hooks'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Check,
  ChefHat,
  Clock,
  Hand,
  Maximize2,
  MessageSquareWarning,
  Play,
  ShoppingBag,
  Smartphone,
  Store,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ROTULOS_CANAL,
  ROTULOS_METODO,
  ROTULOS_MODO,
  type CanalPedido,
  type Pedido,
} from '@/features/pedidos/types'
import { cn } from '@/lib/utils'

type FiltroCanal = 'todos' | CanalPedido

function minutosDesde(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
}

function classeAtraso(min: number): string {
  if (min >= 15) return 'border-l-destructive bg-destructive/5'
  if (min >= 10) return 'border-l-feedback-warning bg-feedback-warning/10'
  return 'border-l-primary bg-card'
}

function corElapsed(min: number): string {
  if (min >= 15) return 'text-destructive'
  if (min >= 10) return 'text-feedback-warning'
  return 'text-foreground'
}

function iconeCanal(canal: CanalPedido) {
  if (canal === 'app') return Smartphone
  if (canal === 'totem') return Hand
  return Store
}

const ICONES_CANAIS = (['todos', 'app', 'totem', 'pdv'] as const).map((id) => ({
  id,
  label: id === 'todos' ? 'Todos' : ROTULOS_CANAL[id],
}))

export default function KDS() {
  const pedidos = useGestaoPedidos().pedidos
  const recarregarPedidos = useGestaoPedidos().recarregarPedidos
  const atualizarStatus = useGestaoPedidos().atualizarStatusPedido

  const [agora, setAgora] = useState(() => new Date())
  const [filtro, setFiltro] = useState<FiltroCanal>('todos')
  const [somOn, setSomOn] = useState(true)
  const [detalhe, setDetalhe] = useState<Pedido | null>(null)

  // Tick a cada 30s pra atualizar elapsed visual
  useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  // Sincroniza pedidos quando outra aba altera localStorage
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== 'raizes_pedidos') return
      recarregarPedidos()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [recarregarPedidos])

  const visiveis = useMemo(
    () =>
      pedidos
        .filter((p) =>
          filtro === 'todos' ? true : p.canal === filtro,
        )
        .filter(
          (p) =>
            p.status === 'recebido' ||
            p.status === 'preparo' ||
            p.status === 'pronto',
        ),
    [pedidos, filtro],
  )

  const recebidos = visiveis.filter((p) => p.status === 'recebido')
  const preparo = visiveis.filter((p) => p.status === 'preparo')
  const pronto = visiveis.filter((p) => p.status === 'pronto')

  const ativos = visiveis.length
  const atrasados = visiveis.filter((p) => minutosDesde(p.criadoEm) >= 15).length
  const tempoMedio =
    visiveis.length === 0
      ? 0
      : Math.round(
          visiveis.reduce((acc, p) => acc + minutosDesde(p.criadoEm), 0) /
            visiveis.length,
        )

  function avancar(p: Pedido) {
    if (p.status === 'recebido') atualizarStatus(p.id, 'preparo')
    else if (p.status === 'preparo') atualizarStatus(p.id, 'pronto')
    else if (p.status === 'pronto') atualizarStatus(p.id, 'retirado')
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-[#1a1208] text-white">
      {/* Top bar do KDS */}
      <header className="flex flex-none items-center justify-between border-b border-white/10 bg-[#2a1a10] px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-white">
            <ChefHat className="size-5" aria-hidden />
          </div>
          <div className="leading-tight">
            <p
              style={{ fontFamily: '"Playfair Display", serif' }}
              className="font-bold uppercase tracking-wide text-white"
            >
              Sertanejão Setor Marista · Cozinha
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-secondary">
              Terminal KDS-02 · {agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            Online · sync agora
          </span>
          <button
            type="button"
            onClick={() => setSomOn((s) => !s)}
            aria-label={somOn ? 'Desligar som' : 'Ligar som'}
            className={cn(
              'grid size-9 place-items-center rounded-md border transition-colors',
              somOn
                ? 'border-secondary/40 bg-secondary/10 text-secondary'
                : 'border-white/10 text-white/70 hover:bg-white/5',
            )}
          >
            {somOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => document.documentElement.requestFullscreen?.()}
            aria-label="Tela cheia"
            className="grid size-9 place-items-center rounded-md border border-white/10 text-white/70 hover:bg-white/5"
          >
            <Maximize2 className="size-4" />
          </button>
        </div>
      </header>

      {/* Stats strip */}
      <div className="flex flex-none items-center gap-6 border-b border-white/10 bg-[#1f140a] px-6 py-3 text-sm">
        <Stat label="Ativos" valor={ativos} />
        <Sep />
        <Stat
          label="Atrasados"
          valor={atrasados}
          alerta={atrasados > 0}
        />
        <Sep />
        <Stat label="Tempo médio" valor={`${tempoMedio} min`} />
        <Sep />
        <Stat label="Pedidos hoje" valor={pedidos.length} />

        <div className="ml-auto flex items-center gap-2">
          {ICONES_CANAIS.map(({ id, label }) => {
            const ativo = filtro === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFiltro(id as FiltroCanal)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors',
                  ativo
                    ? 'bg-primary text-white'
                    : 'border border-white/15 text-white/70 hover:bg-white/5',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Kanban */}
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 md:grid-cols-3">
        <Coluna
          titulo="Recebidos"
          subtitulo="Aguardando início"
          pedidos={recebidos}
          corAccent="bg-secondary/20 text-secondary border-secondary/30"
          ctaIcon={Play}
          ctaLabel="Iniciar preparo"
          ctaVariant="terracota"
          onAvancar={avancar}
          onAbrirDetalhe={setDetalhe}
          emptyText="Nenhum pedido aguardando."
        />
        <Coluna
          titulo="Em preparo"
          subtitulo="Cozinha"
          pedidos={preparo}
          corAccent="bg-primary/20 text-primary border-primary/30"
          ctaIcon={Check}
          ctaLabel="Marcar pronto"
          ctaVariant="green"
          onAvancar={avancar}
          onAbrirDetalhe={setDetalhe}
          emptyText="Nada em preparo."
        />
        <Coluna
          titulo="Prontos"
          subtitulo="Aguardando retirada"
          pedidos={pronto}
          corAccent="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          ctaIcon={ShoppingBag}
          ctaLabel="Marcar retirado"
          ctaVariant="outline"
          onAvancar={avancar}
          onAbrirDetalhe={setDetalhe}
          emptyText="Sem pedidos prontos."
        />
      </div>

      <DialogDetalhePedido
        pedido={detalhe}
        onFechar={() => setDetalhe(null)}
      />
    </div>
  )
}

interface ColunaProps {
  titulo: string
  subtitulo: string
  pedidos: Pedido[]
  corAccent: string
  ctaIcon: typeof Play
  ctaLabel: string
  ctaVariant: 'terracota' | 'green' | 'outline'
  onAvancar: (p: Pedido) => void
  onAbrirDetalhe: (p: Pedido) => void
  emptyText: string
}

function Coluna({
  titulo,
  subtitulo,
  pedidos,
  corAccent,
  ctaIcon: CTAIcon,
  ctaLabel,
  ctaVariant,
  onAvancar,
  onAbrirDetalhe,
  emptyText,
}: ColunaProps) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl bg-white/5">
      <header
        className={cn(
          'flex items-center justify-between rounded-t-xl border-b border-white/10 px-4 py-3',
          corAccent,
        )}
      >
        <div>
          <h2
            style={{ fontFamily: '"Playfair Display", serif' }}
            className="text-lg font-bold leading-none"
          >
            {titulo}
          </h2>
          <p className="mt-1 text-[11px] uppercase tracking-wider opacity-70">
            {subtitulo}
          </p>
        </div>
        <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-base font-bold text-white">
          {pedidos.length}
        </span>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {pedidos.length === 0 ? (
          <p className="grid h-32 place-items-center rounded-lg border border-dashed border-white/10 text-center text-xs italic text-white/50">
            {emptyText}
          </p>
        ) : (
          pedidos.map((p) => (
            <CardPedido
              key={p.id}
              pedido={p}
              onAvancar={() => onAvancar(p)}
              onAbrirDetalhe={() => onAbrirDetalhe(p)}
              ctaIcon={CTAIcon}
              ctaLabel={ctaLabel}
              ctaVariant={ctaVariant}
            />
          ))
        )}
      </div>
    </section>
  )
}

interface CardPedidoProps {
  pedido: Pedido
  onAvancar: () => void
  onAbrirDetalhe: () => void
  ctaIcon: typeof Play
  ctaLabel: string
  ctaVariant: 'terracota' | 'green' | 'outline'
}

function CardPedido({
  pedido,
  onAvancar,
  onAbrirDetalhe,
  ctaIcon: CTAIcon,
  ctaLabel,
  ctaVariant,
}: CardPedidoProps) {
  const elapsed = minutosDesde(pedido.criadoEm)
  const IconeCanal = iconeCanal(pedido.canal)
  const totalItens = pedido.itens.reduce((acc, it) => acc + it.quantidade, 0)
  const obsAgregadas = pedido.itens
    .filter((it) => it.observacoes && it.observacoes.trim())
    .map((it) => `${it.produto.nome}: ${it.observacoes}`)

  return (
    <article
      onClick={onAbrirDetalhe}
      className={cn(
        'cursor-pointer rounded-lg border-l-4 bg-white p-3 text-foreground shadow-md transition-shadow hover:shadow-lg',
        classeAtraso(elapsed),
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-2xl font-bold leading-none text-foreground">
            #{pedido.numero}
          </p>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <IconeCanal className="size-3" aria-hidden />
            {ROTULOS_CANAL[pedido.canal]}
          </span>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold tabular-nums',
            corElapsed(elapsed),
            elapsed >= 15
              ? 'border-destructive/40 bg-destructive/10'
              : elapsed >= 10
                ? 'border-feedback-warning/40 bg-feedback-warning/10'
                : 'border-border bg-card',
          )}
        >
          <Clock className="size-3" aria-hidden />
          {elapsed} min
          {elapsed >= 15 && <AlertTriangle className="size-3" aria-hidden />}
        </span>
      </header>

      {pedido.cpfCliente && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          CPF · {pedido.cpfCliente.slice(0, 3)}.***.{pedido.cpfCliente.slice(-2)}
        </p>
      )}

      <ul className="mt-3 space-y-1.5 border-t border-dashed border-border pt-2">
        {pedido.itens.map((it) => {
          const selecoes = Object.values(it.selecoes).flat()
          return (
            <li key={it.itemId} className="text-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-primary">
                  {it.quantidade}×
                </span>
                <span className="flex-1">
                  <span className="font-medium text-foreground">
                    {it.produto.nome}
                  </span>
                  {selecoes.length > 0 && (
                    <span className="ml-1 text-[11px] italic text-muted-foreground">
                      · {selecoes.map((o) => o.nome).join(', ')}
                    </span>
                  )}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {(precoLinhaSacola(it) * it.quantidade)
                    .toFixed(2)
                    .replace('.', ',')}
                </span>
              </div>
              {it.observacoes && it.observacoes.trim() && (
                <p className="ml-7 mt-0.5 line-clamp-2 text-[11px] italic text-secondary-foreground/90">
                  — {it.observacoes}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {obsAgregadas.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-secondary/40 bg-secondary/15 px-2.5 py-2 text-xs">
          <MessageSquareWarning
            className="mt-0.5 size-4 shrink-0 text-secondary-foreground"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-bold text-foreground">
              Atenção a {obsAgregadas.length === 1 ? 'observação' : 'observações'}
            </p>
            <p className="line-clamp-2 italic text-foreground/80">
              {obsAgregadas.join(' · ')}
            </p>
          </div>
        </div>
      )}

      {pedido.status === 'pronto' && elapsed > 5 && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-feedback-warning/15 px-2.5 py-1.5 text-xs text-feedback-warning">
          <Bell className="size-3.5" aria-hidden /> Aguardando retirada há{' '}
          {elapsed} min
        </div>
      )}

      <footer className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-2 text-[11px] text-muted-foreground">
        <span>
          {totalItens} {totalItens === 1 ? 'item' : 'itens'}
        </span>
        <span className="font-bold text-foreground">
          R$ {pedido.total.toFixed(2).replace('.', ',')}
        </span>
      </footer>

      <Button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onAvancar()
        }}
        size="lg"
        variant={ctaVariant === 'outline' ? 'outline' : 'default'}
        className={cn(
          'mt-3 h-11 w-full text-sm font-bold uppercase tracking-wider',
          ctaVariant === 'green' &&
            'bg-feedback-success text-white hover:bg-feedback-success/90',
        )}
      >
        <CTAIcon className="size-4" aria-hidden />
        {ctaLabel}
      </Button>
    </article>
  )
}

interface DialogDetalheProps {
  pedido: Pedido | null
  onFechar: () => void
}

function DialogDetalhePedido({ pedido, onFechar }: DialogDetalheProps) {
  return (
    <Dialog open={pedido !== null} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="sm:max-w-lg">
        {pedido && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Pedido #{pedido.numero}
              </DialogTitle>
              <DialogDescription>
                {ROTULOS_CANAL[pedido.canal]} ·{' '}
                {ROTULOS_MODO[pedido.modoRetirada]} ·{' '}
                {ROTULOS_METODO[pedido.metodoPagamento]}
              </DialogDescription>
            </DialogHeader>

            <ul className="space-y-3 border-y border-dashed border-border py-4">
              {pedido.itens.map((it) => {
                const selecoes = Object.values(it.selecoes).flat()
                return (
                  <li key={it.itemId} className="text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-primary">
                        {it.quantidade}×
                      </span>
                      <span className="flex-1 font-medium text-foreground">
                        {it.produto.nome}
                      </span>
                      <span className="font-bold tabular-nums text-foreground">
                        R${' '}
                        {(precoLinhaSacola(it) * it.quantidade)
                          .toFixed(2)
                          .replace('.', ',')}
                      </span>
                    </div>
                    {selecoes.length > 0 && (
                      <p className="ml-6 mt-1 text-xs text-muted-foreground">
                        {selecoes.map((o) => o.nome).join(' · ')}
                      </p>
                    )}
                    {it.observacoes && (
                      <p className="ml-6 mt-1 rounded-md border border-secondary/40 bg-secondary/15 px-2 py-1 text-xs italic text-foreground">
                        — {it.observacoes}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>

            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-bold text-foreground">
                  R$ {pedido.total.toFixed(2).replace('.', ',')}
                </dd>
              </div>
              {pedido.cpfCliente && (
                <div>
                  <dt className="text-muted-foreground">CPF</dt>
                  <dd className="font-mono text-foreground">
                    {pedido.cpfCliente.slice(0, 3)}.***.
                    {pedido.cpfCliente.slice(-2)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">Recebido</dt>
                <dd className="text-foreground">
                  {new Date(pedido.criadoEm).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Há quanto tempo</dt>
                <dd className="text-foreground">
                  {minutosDesde(pedido.criadoEm)} min
                </dd>
              </div>
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Stat({
  label,
  valor,
  alerta,
}: {
  label: string
  valor: number | string
  alerta?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
        {label}
      </span>
      <span
        className={cn(
          'font-mono text-lg font-bold',
          alerta ? 'text-destructive' : 'text-white',
        )}
      >
        {valor}
      </span>
      {alerta && <AlertTriangle className="size-4 text-destructive" aria-hidden />}
    </div>
  )
}

function Sep() {
  return <span aria-hidden className="h-5 w-px bg-white/10" />
}
