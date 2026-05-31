import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatarPreco } from '@/lib/formatadores'
import { baixarCsv, montarCsv } from '@/lib/csv'
import { cn } from '@/lib/utils'

type TipoOperacao =
  | 'cancelamento'
  | 'desconto'
  | 'estorno'
  | 'ajuste-estoque'
  | 'comp'

interface Operacao {
  id: string
  data: string
  tipo: TipoOperacao
  pedido?: string
  operador: string
  justificativa: string
  valor: number
}

const ROTULOS_TIPO: Record<TipoOperacao, string> = {
  cancelamento: 'Cancelamento',
  desconto: 'Desconto manual',
  estorno: 'Estorno',
  'ajuste-estoque': 'Ajuste de estoque',
  comp: 'Cortesia',
}

const COR_TIPO: Record<TipoOperacao, string> = {
  cancelamento: 'bg-destructive/10 text-destructive',
  desconto: 'bg-secondary/40 text-secondary-foreground',
  estorno: 'bg-feedback-warning/15 text-feedback-warning',
  'ajuste-estoque': 'bg-feedback-info/15 text-feedback-info',
  comp: 'bg-feedback-success/15 text-feedback-success',
}

// Mock realista — 15 operações
const OPERACOES: Operacao[] = [
  { id: 'op001', data: '07/05 11:42', tipo: 'cancelamento', pedido: '#4502', operador: 'João Silva', justificativa: 'Cliente desistiu — esperou 18 min sem retorno da cozinha.', valor: 32.40 },
  { id: 'op002', data: '07/05 11:30', tipo: 'desconto', pedido: '#4501', operador: 'Maria Costa', justificativa: 'Cliente reclamou de demora; gerente autorizou 20% off.', valor: 12.00 },
  { id: 'op003', data: '07/05 10:58', tipo: 'estorno', pedido: '#4498', operador: 'João Silva', justificativa: 'Pagamento duplicado pelo gateway; estorno do valor extra.', valor: 24.50 },
  { id: 'op004', data: '07/05 09:14', tipo: 'cancelamento', pedido: '#4486', operador: 'Carla Mota', justificativa: 'Item indisponível após confirmação — tapioca de camarão acabou.', valor: 18.00 },
  { id: 'op005', data: '07/05 08:33', tipo: 'ajuste-estoque', operador: 'Carla Mota', justificativa: 'Tapioca seca: −2kg após auditoria do estoque matinal.', valor: 0 },
  { id: 'op006', data: '06/05 22:08', tipo: 'comp', pedido: '#4480', operador: 'Maria Costa', justificativa: 'Cliente fidelidade Ouro — cortesia de café no aniversário.', valor: 8.00 },
  { id: 'op007', data: '06/05 18:42', tipo: 'cancelamento', pedido: '#4471', operador: 'João Silva', justificativa: 'Cliente cancelou via app antes do preparo.', valor: 28.50 },
  { id: 'op008', data: '06/05 14:55', tipo: 'desconto', pedido: '#4465', operador: 'João Silva', justificativa: 'Cupom inválido aplicado por engano — desconto manual de R$ 5,00.', valor: 5.00 },
  { id: 'op009', data: '06/05 13:21', tipo: 'estorno', pedido: '#4459', operador: 'Carla Mota', justificativa: 'Cliente alegou item errado; refeito + estorno parcial.', valor: 14.00 },
  { id: 'op010', data: '06/05 12:11', tipo: 'cancelamento', pedido: '#4453', operador: 'João Silva', justificativa: 'Erro no caixa — duplicidade de lançamento.', valor: 22.40 },
  { id: 'op011', data: '06/05 11:03', tipo: 'desconto', pedido: '#4447', operador: 'Maria Costa', justificativa: 'Cliente regular; desconto de cortesia 10%.', valor: 4.80 },
  { id: 'op012', data: '06/05 10:47', tipo: 'ajuste-estoque', operador: 'Carla Mota', justificativa: 'Manteiga de garrafa: −1kg; perda por excesso de calor.', valor: 0 },
  { id: 'op013', data: '06/05 09:35', tipo: 'cancelamento', pedido: '#4438', operador: 'João Silva', justificativa: 'Cliente com restrição alimentar; receita não compatível.', valor: 16.00 },
  { id: 'op014', data: '05/05 21:12', tipo: 'comp', pedido: '#4421', operador: 'Carla Mota', justificativa: 'Reclamação procedente — pedido cortesia integral.', valor: 42.50 },
  { id: 'op015', data: '05/05 19:48', tipo: 'desconto', pedido: '#4415', operador: 'Maria Costa', justificativa: 'Combo família com 15% — política do mês.', valor: 13.50 },
]

const PAGE_SIZE = 8

const OPERADORES = Array.from(
  new Set(OPERACOES.map((o) => o.operador)),
).sort()

export default function Auditoria() {
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | TipoOperacao>('todos')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [aberto, setAberto] = useState<Operacao | null>(null)
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false)

  // Filtros avançados (rascunho dentro do dialog antes de aplicar)
  const [operadorFiltro, setOperadorFiltro] = useState<string>('todos')
  const [valorMin, setValorMin] = useState<string>('')
  const [valorMax, setValorMax] = useState<string>('')
  const [draftOperador, setDraftOperador] = useState<string>('todos')
  const [draftValorMin, setDraftValorMin] = useState<string>('')
  const [draftValorMax, setDraftValorMax] = useState<string>('')

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const min = parseFloat(valorMin.replace(',', '.'))
    const max = parseFloat(valorMax.replace(',', '.'))
    return OPERACOES.filter((op) => {
      if (tipoFiltro !== 'todos' && op.tipo !== tipoFiltro) return false
      if (operadorFiltro !== 'todos' && op.operador !== operadorFiltro) return false
      if (!isNaN(min) && op.valor < min) return false
      if (!isNaN(max) && op.valor > max) return false
      if (termo) {
        const blob = `${op.pedido ?? ''} ${op.operador} ${op.justificativa}`.toLowerCase()
        if (!blob.includes(termo)) return false
      }
      return true
    })
  }, [tipoFiltro, busca, operadorFiltro, valorMin, valorMax])

  const filtrosAtivos =
    (operadorFiltro !== 'todos' ? 1 : 0) +
    (valorMin ? 1 : 0) +
    (valorMax ? 1 : 0)

  function abrirFiltros() {
    setDraftOperador(operadorFiltro)
    setDraftValorMin(valorMin)
    setDraftValorMax(valorMax)
    setFiltrosAvancadosAbertos(true)
  }

  function aplicarFiltros() {
    setOperadorFiltro(draftOperador)
    setValorMin(draftValorMin)
    setValorMax(draftValorMax)
    setFiltrosAvancadosAbertos(false)
    setPagina(1)
    toast.success('Filtros aplicados.')
  }

  function limparFiltros() {
    setDraftOperador('todos')
    setDraftValorMin('')
    setDraftValorMax('')
    setOperadorFiltro('todos')
    setValorMin('')
    setValorMax('')
  }

  function exportarCsv() {
    const csv = montarCsv(
      ['Data/Hora', 'Operação', 'Pedido', 'Operador', 'Justificativa', 'Valor'],
      filtradas.map((op) => [
        op.data,
        ROTULOS_TIPO[op.tipo],
        op.pedido ?? '',
        op.operador,
        op.justificativa,
        op.valor > 0 ? op.valor.toFixed(2).replace('.', ',') : '',
      ]),
    )
    baixarCsv(`auditoria-${new Date().toISOString().slice(0, 10)}`, csv)
    toast.success(`CSV exportado · ${filtradas.length} operações.`)
  }

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const inicio = (paginaAtual - 1) * PAGE_SIZE
  const visiveis = filtradas.slice(inicio, inicio + PAGE_SIZE)

  const totalDescontos = filtradas
    .filter((o) => o.tipo === 'desconto' || o.tipo === 'comp')
    .reduce((acc, o) => acc + o.valor, 0)
  const totalCancelamentos = filtradas.filter((o) => o.tipo === 'cancelamento').length

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-6 py-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Auditoria de operações
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cancelamentos, descontos, estornos e ajustes — registro imutável.
        </p>
      </header>

      {/* Filtros sticky */}
      <section className="sticky top-0 z-10 -mx-6 border-b border-border bg-background px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search
              className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value)
                setPagina(1)
              }}
              placeholder="Buscar por pedido, operador ou justificativa…"
              className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={tipoFiltro}
            onChange={(e) => {
              setTipoFiltro(e.target.value as 'todos' | TipoOperacao)
              setPagina(1)
            }}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todas operações</option>
            {Object.entries(ROTULOS_TIPO).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={abrirFiltros}>
            <Filter className="size-3.5" aria-hidden />
            Mais filtros
            {filtrosAtivos > 0 && (
              <span className="ml-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {filtrosAtivos}
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={exportarCsv}>
            <Download className="size-3.5" aria-hidden />
            Exportar CSV
          </Button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          <strong className="text-foreground">{filtradas.length}</strong>{' '}
          operações ·{' '}
          <strong className="text-foreground">
            {formatarPreco(totalDescontos)}
          </strong>{' '}
          em descontos ·{' '}
          <strong className="text-foreground">{totalCancelamentos}</strong>{' '}
          cancelamentos
        </p>
      </section>

      {/* Tabela */}
      <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Data / Hora</th>
                <th className="px-4 py-3">Operação</th>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Operador</th>
                <th className="px-4 py-3">Justificativa</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Nada encontrado com esses filtros.
                  </td>
                </tr>
              )}
              {visiveis.map((op) => (
                <tr
                  key={op.id}
                  onClick={() => setAberto(op)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                    {op.data}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                        COR_TIPO[op.tipo],
                      )}
                    >
                      {ROTULOS_TIPO[op.tipo]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-foreground">
                    {op.pedido ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-secondary to-primary text-[10px] font-bold text-white"
                        aria-hidden
                      >
                        {op.operador
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join('')}
                      </span>
                      <span className="text-foreground">{op.operador}</span>
                    </span>
                  </td>
                  <td className="max-w-md px-4 py-3 text-muted-foreground">
                    <p className="line-clamp-1">{op.justificativa}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums text-foreground">
                    {op.valor > 0 ? formatarPreco(op.valor) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setAberto(op)
                      }}
                      aria-label="Ver detalhes"
                      className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Eye className="size-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs">
          <span className="text-muted-foreground">
            Mostrando {Math.min(filtradas.length, inicio + 1)}-
            {Math.min(filtradas.length, inicio + PAGE_SIZE)} de{' '}
            {filtradas.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual <= 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-3.5" aria-hidden />
              Anterior
            </Button>
            <span className="px-3 text-foreground">
              Página {paginaAtual} / {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual >= totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              Próxima
              <ChevronRight className="size-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      </article>

      <p className="text-center text-xs italic text-muted-foreground">
        Dados mockados pra demonstração. Em produção, cada linha vem de um
        registro imutável persistido no backend.
      </p>

      {/* Modal filtros avançados */}
      <Dialog
        open={filtrosAvancadosAbertos}
        onOpenChange={setFiltrosAvancadosAbertos}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Filtros avançados</DialogTitle>
            <DialogDescription>
              Refine por operador e faixa de valor envolvido na operação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <label
                htmlFor="filtro-operador"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Operador
              </label>
              <select
                id="filtro-operador"
                value={draftOperador}
                onChange={(e) => setDraftOperador(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="todos">Todos os operadores</option>
                {OPERADORES.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="filtro-valor-min"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Valor mínimo
                </label>
                <input
                  id="filtro-valor-min"
                  type="text"
                  inputMode="decimal"
                  value={draftValorMin}
                  onChange={(e) => setDraftValorMin(e.target.value)}
                  placeholder="0,00"
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="filtro-valor-max"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Valor máximo
                </label>
                <input
                  id="filtro-valor-max"
                  type="text"
                  inputMode="decimal"
                  value={draftValorMax}
                  onChange={(e) => setDraftValorMax(e.target.value)}
                  placeholder="999,99"
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={limparFiltros}>
              Limpar tudo
            </Button>
            <Button onClick={aplicarFiltros}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhe */}
      <Dialog open={!!aberto} onOpenChange={(open) => !open && setAberto(null)}>
        <DialogContent className="sm:max-w-md">
          {aberto && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Detalhe da operação
                </DialogTitle>
                <DialogDescription>
                  Registro imutável · ID interno{' '}
                  <code className="font-mono">{aberto.id}</code>
                </DialogDescription>
              </DialogHeader>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Operação
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider',
                        COR_TIPO[aberto.tipo],
                      )}
                    >
                      {ROTULOS_TIPO[aberto.tipo]}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quando
                  </dt>
                  <dd className="mt-1 font-mono text-foreground">
                    {aberto.data}
                  </dd>
                </div>
                {aberto.pedido && (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Pedido afetado
                    </dt>
                    <dd className="mt-1 font-mono text-foreground">
                      {aberto.pedido}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Operador responsável
                  </dt>
                  <dd className="mt-1 text-foreground">{aberto.operador}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Justificativa
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {aberto.justificativa}
                  </dd>
                </div>
                {aberto.valor > 0 && (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Valor envolvido
                    </dt>
                    <dd className="mt-1 font-bold text-foreground">
                      {formatarPreco(aberto.valor)}
                    </dd>
                  </div>
                )}
              </dl>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
