import { precoLinhaSacola, useLojaAtiva, useSacola } from '@/hooks'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Banknote,
  Clock,
  CreditCard,
  Smartphone,
  Store,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatarPreco } from '@/lib/formatadores'
import { cn } from '@/lib/utils'

type ModoRetirada = 'balcao' | 'mesa'

type MetodoPagamento = 'pix' | 'credito' | 'debito' | 'vr'

interface OpcaoPagamento {
  id: MetodoPagamento
  nome: string
  hint?: string
  icon: LucideIcon
}

const PAGAMENTOS: OpcaoPagamento[] = [
  { id: 'pix', nome: 'PIX', hint: 'Instantâneo', icon: Smartphone },
  { id: 'credito', nome: 'Cartão de crédito', icon: CreditCard },
  { id: 'debito', nome: 'Cartão de débito', icon: Banknote },
  { id: 'vr', nome: 'Vale-refeição', icon: Wallet },
]

export default function Checkout() {
  const navigate = useNavigate()
  const itens = useSacola().itens
  const cupom = useSacola().cupom
  const { subtotal, desconto, total } = useSacola().totais
  const unidadeAtual = useLojaAtiva().lojaAtiva

  const [modoRetirada, setModoRetirada] = useState<ModoRetirada>('balcao')
  const [metodo, setMetodo] = useState<MetodoPagamento>('pix')

  useEffect(() => {
    if (itens.length === 0) navigate('/carrinho', { replace: true })
  }, [itens, navigate])

  if (itens.length === 0) return null

  return (
    <section className="space-y-6 px-4 py-6 pb-32 md:px-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl text-foreground md:text-4xl">
          Confirmação
        </h1>
        <ol className="flex gap-2" aria-label="Etapas">
          <li className="flex-1 rounded-full bg-primary/40 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Carrinho
          </li>
          <li className="flex-1 rounded-full bg-primary py-1 text-center text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Confirmação
          </li>
          <li className="flex-1 rounded-full bg-muted py-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Pagamento
          </li>
        </ol>
      </header>

      {unidadeAtual && (
        <section
          aria-labelledby="onde-retirar"
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="mb-3 flex items-start justify-between">
            <h2
              id="onde-retirar"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Onde retirar
            </h2>
            <Link
              to="/selecionar-unidade"
              className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
            >
              Trocar
            </Link>
          </div>
          <div className="flex items-start gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Store className="size-5" aria-hidden />
            </div>
            <div>
              <p className="font-bold text-foreground">
                Sertanejão — {unidadeAtual.nome}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {unidadeAtual.endereco}
              </p>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="como-retirar">
        <h2
          id="como-retirar"
          className="mb-3 font-display text-xl text-foreground"
        >
          Como retirar
        </h2>
        <div className="space-y-2">
          {(
            [
              {
                id: 'balcao' as const,
                nome: 'Retirada no balcão',
                hint: 'Sem custo · pronto em ~15 min',
                badge: 'Recomendado',
                icon: Store,
              },
              {
                id: 'mesa' as const,
                nome: 'Consumir no local',
                hint: 'Acomode-se que servimos você',
                icon: UtensilsCrossed,
              },
            ]
          ).map(({ id, nome, hint, badge, icon: Icon }) => {
            const ativo = modoRetirada === id
            return (
              <label
                key={id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-3 shadow-sm transition-colors',
                  ativo
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/40',
                )}
              >
                <input
                  type="radio"
                  name="modo-retirada"
                  value={id}
                  checked={ativo}
                  onChange={() => setModoRetirada(id)}
                  className="mt-1 size-5 accent-primary"
                />
                <Icon
                  className="size-5 shrink-0 text-primary"
                  aria-hidden
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {nome}
                    </span>
                    {badge && (
                      <span className="rounded-full bg-secondary/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-secondary-foreground">
                        {badge}
                      </span>
                    )}
                  </div>
                  {hint && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {hint}
                    </p>
                  )}
                </div>
              </label>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="resumo">
        <h2 id="resumo" className="mb-3 font-display text-xl text-foreground">
          Resumo do pedido
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <ul className="space-y-2.5">
            {itens.map((item) => (
              <li
                key={item.itemId}
                className="flex items-start justify-between gap-3 border-b border-dashed border-border pb-2.5 last:border-0 last:pb-0"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded bg-muted text-xs font-bold text-foreground">
                    {item.quantidade}×
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      {item.produto.nome}
                    </p>
                    {Object.values(item.selecoes).flat().length > 0 && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {Object.values(item.selecoes)
                          .flat()
                          .map((o) => o.nome)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-sm text-foreground">
                  {formatarPreco(precoLinhaSacola(item) * item.quantidade)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1.5 border-t border-dashed border-border pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatarPreco(subtotal)}</span>
            </div>
            {cupom && (
              <div className="flex justify-between text-primary">
                <span>Desconto ({cupom.codigo})</span>
                <span>−{formatarPreco(desconto)}</span>
              </div>
            )}
            <div className="flex items-end justify-between pt-2">
              <span className="font-display text-lg text-foreground">Total</span>
              <span className="font-display text-2xl text-primary">
                {formatarPreco(total)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="pagamento">
        <h2
          id="pagamento"
          className="mb-3 font-display text-xl text-foreground"
        >
          Forma de pagamento
        </h2>
        <div className="space-y-2">
          {PAGAMENTOS.map(({ id, nome, hint, icon: Icon }) => {
            const ativo = metodo === id
            return (
              <label
                key={id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border p-3 shadow-sm transition-colors',
                  ativo
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/40',
                )}
              >
                <input
                  type="radio"
                  name="pagamento"
                  value={id}
                  checked={ativo}
                  onChange={() => setMetodo(id)}
                  className="size-5 accent-primary"
                />
                <Icon
                  className={cn(
                    'size-5 shrink-0',
                    ativo ? 'text-primary' : 'text-muted-foreground',
                  )}
                  aria-hidden
                />
                <span className="flex flex-1 flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">{nome}</span>
                  {hint && (
                    <span className="rounded-full bg-feedback-success/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-feedback-success">
                      {hint}
                    </span>
                  )}
                </span>
              </label>
            )
          })}
        </div>
      </section>

      <aside className="flex items-center gap-3 rounded-xl border border-border bg-secondary/15 p-4">
        <Clock className="size-5 text-foreground" aria-hidden />
        <p className="text-sm text-foreground">
          Tempo estimado: <strong>15-20 minutos</strong> após pagamento
          confirmado.
        </p>
      </aside>

      <div className="fixed bottom-16 left-0 right-0 z-20 border-t border-border bg-card px-4 py-3 md:bottom-0">
        <div className="mx-auto w-full max-w-2xl">
          <Button
            size="lg"
            className="h-12 w-full text-sm font-bold uppercase tracking-wide"
            onClick={() =>
              navigate('/pagamento', {
                state: { metodo, modoRetirada, total },
              })
            }
          >
            Pagar {formatarPreco(total)}
          </Button>
        </div>
      </div>
    </section>
  )
}
