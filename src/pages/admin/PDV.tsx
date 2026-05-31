import { useGestaoPedidos, useLojaAtiva } from '@/hooks'
import { useEffect, useMemo, useState } from 'react'
import {
  Banknote,
  Check,
  CreditCard,
  Minus,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Smartphone,
  Tag,
  UtensilsCrossed,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { listarCatalogoUnidade } from '@/services/catalogoApi'
import { validarVoucher } from '@/services/voucherApi'
import { CATEGORIAS, type Categoria, type Produto } from '@/features/cardapio/types'
import type { Cupom, ItemCarrinho } from '@/features/carrinho/types'
import type { MetodoPagamento, ModoRetirada } from '@/features/pedidos/types'
import { formatarPreco } from '@/lib/formatadores'
import { mascararCPF } from '@/lib/validators'
import { cn } from '@/lib/utils'

// Carrinho local do PDV — não compartilha estado com o cliente.
interface ItemPDV {
  produto: Produto
  qty: number
}

interface OpcaoPagamento {
  id: MetodoPagamento
  label: string
  icon: LucideIcon
}

const PAGAMENTOS: OpcaoPagamento[] = [
  { id: 'pix', label: 'PIX', icon: Smartphone },
  { id: 'credito', label: 'Crédito', icon: CreditCard },
  { id: 'debito', label: 'Débito', icon: Banknote },
  { id: 'vr', label: 'VR', icon: Wallet },
]

export default function PDV() {
  const unidadeAtual = useLojaAtiva().lojaAtiva
  const criarPedido = useGestaoPedidos().registrarPedido

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [catFiltro, setCatFiltro] = useState<'todos' | Categoria>('todos')

  const [cart, setCart] = useState<Record<string, ItemPDV>>({})
  const [cpf, setCpf] = useState('')
  const [pickup, setPickup] = useState<ModoRetirada>('balcao')
  const [payment, setPayment] = useState<MetodoPagamento>('pix')
  const [cupom, setCupom] = useState<Cupom | null>(null)
  const [codigoCupom, setCodigoCupom] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!unidadeAtual) return
    setCarregando(true)
    listarCatalogoUnidade(unidadeAtual.id)
      .then(setProdutos)
      .finally(() => setCarregando(false))
  }, [unidadeAtual])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return produtos.filter((p) => {
      if (catFiltro !== 'todos' && p.categoria !== catFiltro) return false
      if (termo) {
        const blob = `${p.nome} ${p.descricao}`.toLowerCase()
        if (!blob.includes(termo)) return false
      }
      return true
    })
  }, [produtos, busca, catFiltro])

  const itens = Object.values(cart)
  const subtotal = itens.reduce(
    (acc, it) => acc + it.produto.preco * it.qty,
    0,
  )
  const desconto = cupom
    ? cupom.tipo === 'percentual'
      ? Math.max(0, (subtotal * cupom.valor) / 100)
      : Math.min(subtotal, cupom.valor)
    : 0
  const total = Math.max(0, subtotal - desconto)
  const totalItens = itens.reduce((acc, it) => acc + it.qty, 0)

  function add(p: Produto) {
    setCart((prev) => {
      const cur = prev[p.id]
      return { ...prev, [p.id]: { produto: p, qty: (cur?.qty ?? 0) + 1 } }
    })
  }

  function setQty(id: string, delta: number) {
    setCart((prev) => {
      const cur = prev[id]
      if (!cur) return prev
      const next = cur.qty + delta
      const clone = { ...prev }
      if (next <= 0) delete clone[id]
      else clone[id] = { ...cur, qty: next }
      return clone
    })
  }

  function remove(id: string) {
    setCart((prev) => {
      const c = { ...prev }
      delete c[id]
      return c
    })
  }

  function limpar() {
    setCart({})
    setCupom(null)
    setCpf('')
    setCodigoCupom('')
  }

  async function aplicarCupom() {
    if (!codigoCupom.trim()) return
    const r = await validarVoucher(codigoCupom)
    if (r.valido) {
      setCupom(r.cupom)
      toast.success(`Cupom ${r.cupom.codigo} aplicado`)
      setCodigoCupom('')
    } else {
      toast.error('Cupom inválido')
    }
  }

  function confirmar() {
    if (!unidadeAtual || itens.length === 0) return
    setEnviando(true)
    // Converte ItemPDV[] pra ItemCarrinho[] pra reaproveitar o PedidosContext
    const itensPedido: ItemCarrinho[] = itens.map((it) => ({
      itemId: `pdv_${it.produto.id}_${Date.now()}`,
      produto: it.produto,
      quantidade: it.qty,
      selecoes: {},
    }))
    const pedido = criarPedido({
      unidadeId: unidadeAtual.id,
      unidadeNome: unidadeAtual.nome,
      itens: itensPedido,
      cupom,
      subtotal,
      desconto,
      total,
      metodoPagamento: payment,
      modoRetirada: pickup,
      canal: 'pdv',
      cpfCliente: cpf.replace(/\D/g, '') || undefined,
      transacaoId: `pdv_${Date.now()}`,
    })
    setEnviando(false)
    limpar()
    toast.success(`Pedido #${pedido.numero} confirmado!`, {
      description: 'Já está na fila da cozinha.',
    })
  }

  if (!unidadeAtual) {
    return (
      <section className="grid min-h-[60vh] place-items-center px-6 text-center">
        <p className="text-sm text-muted-foreground">
          Selecione uma unidade pra começar a operar o PDV.
        </p>
      </section>
    )
  }

  return (
    <div className="grid h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[1fr_400px]">
      {/* COLUNA ESQUERDA — produtos */}
      <section className="flex min-h-0 flex-col border-r border-border">
        <div className="border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto pelo nome…"
                className="h-11 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <span className="hidden rounded border border-border bg-card px-2 py-1 text-[10px] font-mono text-muted-foreground md:inline-block">
              ⌘ K
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ChipCategoria
              ativo={catFiltro === 'todos'}
              onClick={() => setCatFiltro('todos')}
              count={produtos.length}
            >
              Todos
            </ChipCategoria>
            {CATEGORIAS.map((c) => (
              <ChipCategoria
                key={c.id}
                ativo={catFiltro === c.id}
                onClick={() => setCatFiltro(c.id)}
                count={produtos.filter((p) => p.categoria === c.id).length}
              >
                {c.nome}
              </ChipCategoria>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {catFiltro === 'todos'
              ? `Cardápio · ${filtrados.length} itens`
              : `${CATEGORIAS.find((c) => c.id === catFiltro)?.nome} · ${filtrados.length}`}
          </p>

          {carregando && (
            <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <li
                  key={i}
                  className="h-44 animate-pulse rounded-lg bg-muted"
                  aria-hidden
                />
              ))}
            </ul>
          )}

          {!carregando && (
            <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-4">
              {filtrados.map((p) => {
                const qtdNoCarrinho = cart[p.id]?.qty ?? 0
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => add(p)}
                      className={cn(
                        'flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md',
                        qtdNoCarrinho > 0
                          ? 'border-primary'
                          : 'border-border',
                      )}
                    >
                      <div className="aspect-[3/2] overflow-hidden bg-muted">
                        <img
                          src={p.imagem}
                          alt={p.nome}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1 p-3">
                        <p className="line-clamp-2 text-sm font-bold text-foreground">
                          {p.nome}
                        </p>
                        <p className="line-clamp-1 text-[11px] text-muted-foreground">
                          {p.descricao}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="font-bold text-primary">
                            {formatarPreco(p.preco)}
                          </span>
                          <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
                            {qtdNoCarrinho > 0 ? (
                              <Check className="size-3.5" aria-hidden />
                            ) : (
                              <Plus className="size-3.5" aria-hidden />
                            )}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      {/* COLUNA DIREITA — pedido */}
      <aside className="flex min-h-0 flex-col bg-card">
        <header className="border-b border-border px-5 py-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">
              Pedido em construção
            </h2>
            <span className="font-mono text-sm text-muted-foreground">
              #novo
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalItens === 0
              ? 'Toque em um produto para começar.'
              : `${totalItens} ${totalItens === 1 ? 'item' : 'itens'} · pronto em ~12 min`}
          </p>
        </header>

        <div className="border-b border-border px-5 py-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            CPF do cliente <span className="font-normal normal-case">(opcional)</span>
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(mascararCPF(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {itens.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-muted-foreground">
              <div>
                <ShoppingBag className="mx-auto mb-2 size-8 opacity-40" aria-hidden />
                <p className="text-sm">Nenhum item ainda.</p>
                <p className="mt-0.5 text-xs">Toque em um produto à esquerda.</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {itens.map((it) => (
                <li
                  key={it.produto.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-background p-2.5"
                >
                  <div className="size-12 shrink-0 overflow-hidden rounded bg-muted">
                    <img
                      src={it.produto.imagem}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {it.produto.nome}
                    </p>
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-border bg-card px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => setQty(it.produto.id, -1)}
                        aria-label="Diminuir"
                        className="grid size-6 place-items-center rounded text-primary hover:bg-primary/10"
                      >
                        <Minus className="size-3" aria-hidden />
                      </button>
                      <span className="min-w-[1.5ch] text-center text-xs font-bold text-foreground">
                        {it.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(it.produto.id, +1)}
                        aria-label="Aumentar"
                        className="grid size-6 place-items-center rounded text-primary hover:bg-primary/10"
                      >
                        <Plus className="size-3" aria-hidden />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => remove(it.produto.id)}
                      aria-label={`Remover ${it.produto.nome}`}
                      className="ml-auto block rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                    <span className="mt-1 block text-sm font-bold text-foreground">
                      {formatarPreco(it.produto.preco * it.qty)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Cupom + opções + total + CTA */}
        <div className="border-t border-border px-5 py-3">
          {cupom ? (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 p-2">
              <Tag className="size-4 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-primary">{cupom.codigo}</p>
                <p className="text-[11px] text-muted-foreground">
                  desconto de {formatarPreco(desconto)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCupom(null)}
                aria-label="Remover cupom"
                className="rounded p-1 text-primary/70 hover:bg-primary/10"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void aplicarCupom()
              }}
              className="mb-3 flex gap-2"
            >
              <input
                type="text"
                value={codigoCupom}
                onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
                placeholder="Cupom"
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-xs uppercase focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!codigoCupom.trim()}
                className="h-9"
              >
                Aplicar
              </Button>
            </form>
          )}

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Tipo de retirada
            </p>
            <div className="grid grid-cols-2 gap-2">
              <BotaoOpcao
                ativo={pickup === 'balcao'}
                onClick={() => setPickup('balcao')}
                icon={ShoppingBag}
              >
                Balcão
              </BotaoOpcao>
              <BotaoOpcao
                ativo={pickup === 'mesa'}
                onClick={() => setPickup('mesa')}
                icon={UtensilsCrossed}
              >
                No local
              </BotaoOpcao>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Pagamento
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {PAGAMENTOS.map(({ id, label, icon: Icon }) => {
                const ativo = payment === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPayment(id)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 rounded-md border px-1 py-2 text-[11px] font-bold transition-colors',
                      ativo
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-3 space-y-1 border-t border-dashed border-border pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatarPreco(subtotal)}</span>
            </div>
            {desconto > 0 && (
              <div className="flex justify-between text-primary">
                <span>Desconto</span>
                <span>−{formatarPreco(desconto)}</span>
              </div>
            )}
            <div className="flex items-end justify-between border-t border-border pt-2">
              <span className="font-display text-base font-bold text-foreground">
                Total
              </span>
              <span className="font-display text-2xl font-bold text-primary">
                {formatarPreco(total)}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <Button
              type="button"
              size="lg"
              disabled={itens.length === 0 || enviando}
              onClick={confirmar}
              className="h-11 w-full font-bold uppercase tracking-wider"
            >
              <Receipt className="size-4" aria-hidden />
              Confirmar pedido
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={itens.length === 0}
              onClick={limpar}
              className="h-9 w-full text-xs uppercase tracking-wider text-muted-foreground"
            >
              Limpar pedido
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )
}

interface ChipProps {
  ativo: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}

function ChipCategoria({ ativo, onClick, count, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        ativo
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
      <span
        className={cn(
          'rounded-full px-1.5 text-[10px] font-bold',
          ativo ? 'bg-white/20' : 'bg-muted',
        )}
      >
        {count}
      </span>
    </button>
  )
}

interface BotaoOpcaoProps {
  ativo: boolean
  onClick: () => void
  icon: LucideIcon
  children: React.ReactNode
}

function BotaoOpcao({ ativo, onClick, icon: Icon, children }: BotaoOpcaoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-bold transition-colors',
        ativo
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {children}
    </button>
  )
}
