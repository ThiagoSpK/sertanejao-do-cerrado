import { precoLinhaSacola, useGestaoPedidos, useLojaAtiva } from '@/hooks'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  Receipt,
  Star,
  Trophy,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { formatarPreco } from '@/lib/formatadores'
import { baixarCsv, montarCsv } from '@/lib/csv'
import { cn } from '@/lib/utils'

// Vendas por hora — pico no café da manhã (7-9h) e almoço (11-13h)
const VENDAS_HORA = [
  { hora: '07h', valor: 380 },
  { hora: '08h', valor: 612 },
  { hora: '09h', valor: 484 },
  { hora: '10h', valor: 220 },
  { hora: '11h', valor: 580 },
  { hora: '12h', valor: 740 },
  { hora: '13h', valor: 510 },
  { hora: '14h', valor: 195 },
  { hora: '15h', valor: 158 },
  { hora: '16h', valor: 140 },
  { hora: '17h', valor: 110 },
  { hora: '18h', valor: 95 },
  { hora: '19h', valor: 78 },
]

// Estoque crítico — mock; em produção viria de inventário
const ESTOQUE_CRITICO = [
  { item: 'Manteiga de garrafa', restante: '2 unidades', severidade: 'alta' },
  { item: 'Queijo coalho', restante: '5 unidades', severidade: 'media' },
  { item: 'Tapioca seca', restante: '1 kg', severidade: 'alta' },
] as const

// Operações sensíveis — mock que será real quando Auditoria persistir eventos
const OPERACOES_SENSIVEIS = [
  { hora: '11:42', operador: 'João Silva', tipo: 'Cancelamento', detalhe: '#4502' },
  { hora: '11:30', operador: 'Maria Costa', tipo: 'Desconto manual', detalhe: '−R$ 12,00' },
  { hora: '10:58', operador: 'João Silva', tipo: 'Estorno', detalhe: '#4498' },
  { hora: '09:14', operador: 'Carla Mota', tipo: 'Cancelamento', detalhe: '#4486' },
  { hora: '08:33', operador: 'Carla Mota', tipo: 'Ajuste estoque', detalhe: 'Tapioca −2kg' },
] as const

// Equipe ativa — iniciais e nome
const EQUIPE_ATIVA = [
  { nome: 'João Silva', role: 'Atendente · turno tarde' },
  { nome: 'Maria Costa', role: 'Cozinha · brigada' },
  { nome: 'Carla Mota', role: 'Gerente' },
  { nome: 'Caio Mendes', role: 'Cozinha · doces' },
] as const

function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

type Periodo = 'hoje' | 'semana' | 'mes'

const ROTULOS_PERIODO: Record<Periodo, string> = {
  hoje: 'Hoje',
  semana: 'Esta semana',
  mes: 'Este mês',
}

export default function Dashboard() {
  const pedidos = useGestaoPedidos().pedidos
  const unidadeAtual = useLojaAtiva().lojaAtiva
  const [periodo, setPeriodo] = useState<Periodo>('hoje')
  const hidratado = useGestaoPedidos().hidratado

  const stats = useMemo(() => {
    const hoje = new Date().toDateString()
    const dohoje = pedidos.filter(
      (p) => new Date(p.criadoEm).toDateString() === hoje,
    )
    const ativos = dohoje.filter(
      (p) => p.status === 'recebido' || p.status === 'preparo' || p.status === 'pronto',
    )
    const vendas = dohoje.reduce((acc, p) => acc + p.total, 0)
    // Soma do mock + dados reais pra demo ter números bonitos
    const vendasComMock = vendas + 3842.5
    const totalPedidosComMock = dohoje.length + 87
    const ticket =
      totalPedidosComMock === 0 ? 0 : vendasComMock / totalPedidosComMock
    return {
      vendas: vendasComMock,
      pedidos: totalPedidosComMock,
      ticket,
      ativos: ativos.length + 5,
      tempoMedioKds: 11.4,
      abandonoSacola: 18.2,
      pedidosPorHora: 6.8,
    }
  }, [pedidos])

  const top5 = useMemo(() => {
    const acc = new Map<string, { nome: string; qty: number; receita: number }>()
    pedidos.forEach((p) =>
      p.itens.forEach((it) => {
        const cur = acc.get(it.produto.id) ?? {
          nome: it.produto.nome,
          qty: 0,
          receita: 0,
        }
        cur.qty += it.quantidade
        cur.receita += precoLinhaSacola(it) * it.quantidade
        acc.set(it.produto.id, cur)
      }),
    )
    const dataReal = Array.from(acc.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)

    // Garante 5 linhas com mock se ainda não há pedidos suficientes
    const mock = [
      { nome: 'Tapioca de Carne de Sol', qty: 28, receita: 798.0 },
      { nome: 'Cuscuz com Carne de Sol e Queijo', qty: 22, receita: 572.0 },
      { nome: 'Tapioca de Frango com Catupiry', qty: 19, receita: 418.0 },
      { nome: 'Café Coado da Casa', qty: 47, receita: 235.0 },
      { nome: 'Suco de Caju', qty: 31, receita: 248.0 },
    ]
    return dataReal.length >= 5 ? dataReal : mock
  }, [pedidos])

  if (!hidratado) return <DashboardSkeleton />

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Central de indicadores
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Operação ao vivo · {unidadeAtual?.nome ?? 'Boa Viagem'} ·{' '}
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="size-3.5" aria-hidden />
                {ROTULOS_PERIODO[periodo]}
                <ChevronDown className="size-3.5 opacity-60" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(ROTULOS_PERIODO) as Periodo[]).map((p) => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => {
                    setPeriodo(p)
                    toast.success(`Período: ${ROTULOS_PERIODO[p]}`, {
                      description:
                        p !== 'hoje'
                          ? 'Demonstração — números mock continuam refletindo o dia atual.'
                          : undefined,
                    })
                  }}
                  className={cn(
                    'cursor-pointer',
                    periodo === p && 'font-bold text-primary',
                  )}
                >
                  {ROTULOS_PERIODO[p]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csv = montarCsv(
                ['Métrica', 'Valor'],
                [
                  ['Vendas', stats.vendas.toFixed(2).replace('.', ',')],
                  ['Pedidos', stats.pedidos],
                  ['Ticket médio', stats.ticket.toFixed(2).replace('.', ',')],
                  ['Pedidos ativos', stats.ativos],
                  [],
                  ['Top 5 produtos', ''],
                  ['#', 'Produto;Qtd;Receita'],
                  ...top5.map((p, i) => [
                    `${i + 1}`,
                    `${p.nome};${p.qty};${p.receita.toFixed(2).replace('.', ',')}`,
                  ]),
                ],
              )
              baixarCsv(`dashboard-${periodo}-${new Date().toISOString().slice(0, 10)}`, csv)
              toast.success('CSV exportado.')
            }}
          >
            <Download className="size-3.5" aria-hidden />
            Exportar CSV
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Faturamento do turno"
          valor={formatarPreco(stats.vendas)}
          delta="+12% vs ontem"
          variant="primary"
        />
        <Kpi
          label="Ticket médio"
          valor={formatarPreco(stats.ticket)}
          delta="+R$ 1,40"
          variant="default"
        />
        <Kpi
          label="Tempo médio KDS"
          valor={`${stats.tempoMedioKds.toFixed(1)} min`}
          delta="meta ≤ 15 min"
          variant="warning"
        />
        <Kpi
          label="Abandono de sacola"
          valor={`${stats.abandonoSacola.toFixed(1)}%`}
          delta={`${stats.pedidosPorHora.toFixed(1)} ped/h`}
          variant="default"
        />
      </ul>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              Volume horário de pedidos
            </h2>
            <span className="text-xs text-muted-foreground">
              Picos: café 7–9h · almoço 11–13h
            </span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VENDAS_HORA} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C84B31" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#C84B31" stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#e5dfd4"
                />
                <XAxis
                  dataKey="hora"
                  tick={{ fontSize: 11, fill: '#6b6358' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b6358' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(200, 75, 49, 0.06)' }}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #d9d2c7',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v) => [formatarPreco(Number(v)), 'Vendas']}
                />
                <Bar dataKey="valor" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              Top 5 produtos
            </h2>
            <Trophy className="size-4 text-secondary-foreground" aria-hidden />
          </div>
          <ol className="space-y-2.5">
            {top5.map((p, i) => (
              <li
                key={p.nome}
                className="flex items-center gap-3 rounded-md border border-border bg-background p-2.5"
              >
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold',
                    i === 0
                      ? 'bg-secondary text-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">
                    {p.nome}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.qty} vendidos
                  </p>
                </div>
                <span className="text-sm font-bold text-primary tabular-nums">
                  {formatarPreco(p.receita)}
                </span>
              </li>
            ))}
          </ol>
        </article>
      </div>

      {/* Cards row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-xl border-l-4 border-l-feedback-warning border-y border-r border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">
              Estoque crítico
            </h2>
            <AlertTriangle className="size-4 text-feedback-warning" aria-hidden />
          </div>
          <ul className="space-y-2">
            {ESTOQUE_CRITICO.map((e) => (
              <li
                key={e.item}
                className="flex items-center justify-between gap-2 border-b border-dashed border-border pb-2 last:border-0 last:pb-0"
              >
                <span className="text-sm text-foreground">{e.item}</span>
                <span
                  className={cn(
                    'rounded px-2 py-0.5 text-xs font-bold',
                    e.severidade === 'alta'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-feedback-warning/15 text-feedback-warning',
                  )}
                >
                  {e.restante}
                </span>
              </li>
            ))}
          </ul>
          <Button variant="link" size="sm" className="mt-3 h-auto p-0 text-xs">
            Repor agora
            <ChevronRight className="size-3" aria-hidden />
          </Button>
        </article>

        <article className="rounded-xl border-l-4 border-l-feedback-info border-y border-r border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">
              Operações sensíveis
            </h2>
            <Receipt className="size-4 text-feedback-info" aria-hidden />
          </div>
          <ul className="space-y-2">
            {OPERACOES_SENSIVEIS.map((op, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between gap-2 border-b border-dashed border-border pb-2 last:border-0 last:pb-0 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate text-foreground">
                    <strong>{op.tipo}</strong> · {op.detalhe}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {op.hora} · {op.operador}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Button asChild variant="link" size="sm" className="mt-3 h-auto p-0 text-xs">
            <Link to="/admin/auditoria">
              Ver auditoria
              <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          </Button>
        </article>

        <article className="rounded-xl border-l-4 border-l-feedback-success border-y border-r border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">
              Equipe ativa agora
            </h2>
            <Users className="size-4 text-feedback-success" aria-hidden />
          </div>
          <div className="-space-x-2 mb-3 flex">
            {EQUIPE_ATIVA.map((p) => (
              <div
                key={p.nome}
                title={`${p.nome} · ${p.role}`}
                className="grid size-10 place-items-center rounded-full border-2 border-card bg-gradient-to-br from-secondary to-primary text-xs font-bold text-white"
              >
                {iniciais(p.nome)}
              </div>
            ))}
          </div>
          <ul className="space-y-1.5 text-xs">
            {EQUIPE_ATIVA.map((p) => (
              <li key={p.nome} className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-feedback-success" />
                <span className="truncate text-foreground">
                  <strong>{p.nome}</strong>{' '}
                  <span className="text-muted-foreground">— {p.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <p className="text-center text-xs italic text-muted-foreground">
        Dados parcialmente mockados pra demonstração — em produção, todas as
        métricas seriam alimentadas pelo backend e refletiriam a operação real.
      </p>
    </div>
  )
}

interface KpiProps {
  label: string
  valor: string
  delta: string
  variant?: 'primary' | 'default' | 'warning'
}

function Kpi({ label, valor, delta, variant = 'default' }: KpiProps) {
  return (
    <li
      className={cn(
        'rounded-xl border bg-card p-5 shadow-sm',
        variant === 'primary' && 'border-primary/30 bg-primary/5',
        variant === 'warning' && 'border-feedback-warning/30 bg-feedback-warning/5',
        variant === 'default' && 'border-border',
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        style={{ fontFamily: '"Playfair Display", serif' }}
        className="mt-2 text-3xl font-bold leading-none text-foreground"
      >
        {valor}
      </p>
      <p
        className={cn(
          'mt-2 inline-flex items-center gap-1 text-[11px] font-semibold',
          variant === 'primary' && 'text-primary',
          variant === 'warning' && 'text-feedback-warning',
          variant === 'default' && 'text-feedback-success',
        )}
      >
        <Star className="size-3 fill-current" aria-hidden />
        {delta}
      </p>
    </li>
  )
}

function DashboardSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl space-y-6 px-6 py-6"
      role="status"
      aria-busy
      aria-live="polite"
    >
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </header>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-9 w-32" />
            <Skeleton className="mt-2 h-3 w-28" />
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <Skeleton className="mb-4 h-5 w-48" />
          <div className="flex h-[280px] items-end gap-2">
            {Array.from({ length: 13 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-md"
                style={{ height: `${30 + Math.random() * 70}%` }}
              />
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <Skeleton className="mb-4 h-5 w-32" />
          <ul className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-md border border-border bg-background p-2.5"
              >
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-4 w-16" />
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  )
}
