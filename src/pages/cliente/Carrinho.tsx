import { precoLinhaSacola, useLojaAtiva, useSacola } from '@/hooks'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react'
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
import { validarVoucher } from '@/services/voucherApi'
import type { ItemCarrinho } from '@/features/carrinho/types'
import { formatarPreco } from '@/lib/formatadores'

const MOTIVO_LABEL: Record<string, string> = {
  inexistente: 'Cupom não encontrado.',
  inativo: 'Esse cupom não está mais ativo.',
  expirado: 'Cupom expirado.',
}

function resumoSelecoes(item: ItemCarrinho): string {
  const partes = Object.values(item.selecoes)
    .flat()
    .map((o) => o.nome)
  if (item.observacoes) partes.push(`Obs: ${item.observacoes}`)
  return partes.join(' · ')
}

export default function Carrinho() {
  const navigate = useNavigate()
  const itens = useSacola().itens
  const cupom = useSacola().cupom
  const atualizarQuantidade = useSacola().alterarQuantidade
  const remover = useSacola().removerItem
  const aplicarCupom = useSacola().aplicarVoucher
  const removerCupom = useSacola().removerVoucher
  const limpar = useSacola().esvaziarSacola
  const { subtotal, desconto, total } = useSacola().totais
  const unidadeAtual = useLojaAtiva().lojaAtiva

  const [codigoCupom, setCodigoCupom] = useState('')
  const [validandoCupom, setValidandoCupom] = useState(false)
  const [confirmarLimpar, setConfirmarLimpar] = useState(false)

  async function handleAplicarCupom() {
    if (!codigoCupom.trim()) return
    setValidandoCupom(true)
    try {
      const res = await validarVoucher(codigoCupom)
      if (res.valido) {
        aplicarCupom(res.cupom)
        toast.success(`Cupom ${res.cupom.codigo} aplicado.`)
        setCodigoCupom('')
      } else {
        toast.error(MOTIVO_LABEL[res.motivo] ?? 'Cupom inválido.')
      }
    } finally {
      setValidandoCupom(false)
    }
  }

  if (itens.length === 0) {
    return (
      <section className="grid min-h-[60vh] place-items-center px-6 py-12 text-center">
        <div className="max-w-sm space-y-4">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="size-9" aria-hidden />
          </div>
          <h1 className="font-display text-2xl text-foreground">
            Seu carrinho está vazio
          </h1>
          <p className="text-sm text-muted-foreground">
            Que tal começar pelas tapiocas? A de carne de sol é a queridinha da
            casa.
          </p>
          <Button asChild className="mt-2 w-full">
            <Link to="/cardapio">Ver cardápio</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 px-4 py-6 pb-32 md:px-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-foreground md:text-4xl">
          Meu carrinho
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setConfirmarLimpar(true)}
          aria-label="Esvaziar carrinho"
        >
          <Trash2 />
        </Button>
      </header>

      {unidadeAtual && (
        <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground">
          Retirada em <strong>Sertanejão — {unidadeAtual.nome}</strong>
          <span className="block text-xs text-muted-foreground">
            Pronto em ~15 min após confirmação do pagamento.
          </span>
        </p>
      )}

      <ul className="space-y-3">
        {itens.map((item) => {
          const unit = precoLinhaSacola(item)
          const totalLinha = unit * item.quantidade
          const sublabel = resumoSelecoes(item)
          return (
            <li key={item.itemId}>
              <article className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={item.produto.imagem}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-foreground">
                    {item.produto.nome}
                  </h3>
                  {sublabel && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {sublabel}
                    </p>
                  )}
                  <p className="mt-1.5 text-sm text-foreground">
                    {formatarPreco(totalLinha)}
                    {item.quantidade > 1 && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({formatarPreco(unit)} cada)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    type="button"
                    onClick={() => remover(item.itemId)}
                    className="-mr-1 -mt-1 p-1 text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remover ${item.produto.nome}`}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                  <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-1.5 py-1">
                    <button
                      type="button"
                      onClick={() =>
                        atualizarQuantidade(item.itemId, item.quantidade - 1)
                      }
                      className="grid size-7 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="size-3.5" aria-hidden />
                    </button>
                    <span
                      className="min-w-[1.5ch] text-center text-sm font-bold text-foreground"
                      aria-live="polite"
                    >
                      {item.quantidade}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        atualizarQuantidade(item.itemId, item.quantidade + 1)
                      }
                      className="grid size-7 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="size-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>

      <section
        aria-label="Cupom de desconto"
        className="space-y-3 rounded-xl border border-dashed border-border p-4"
      >
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-primary" aria-hidden />
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
            Tem um cupom?
          </h2>
        </div>

        {cupom ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="min-w-0">
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                {cupom.codigo}
              </span>
              <p className="mt-1.5 text-xs text-foreground">
                Desconto de {formatarPreco(desconto)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                removerCupom()
                toast.success('Cupom removido.')
              }}
              className="text-primary/70 transition-colors hover:text-primary"
              aria-label="Remover cupom"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void handleAplicarCupom()
            }}
          >
            <label htmlFor="cupom" className="sr-only">
              Código do cupom
            </label>
            <input
              id="cupom"
              type="text"
              value={codigoCupom}
              onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
              placeholder="Insira seu cupom..."
              className="h-11 flex-1 rounded-lg border border-input bg-card px-3 text-sm uppercase text-foreground placeholder:text-muted-foreground placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              type="submit"
              disabled={validandoCupom || !codigoCupom.trim()}
              className="h-11"
            >
              {validandoCupom ? 'Validando…' : 'Aplicar'}
            </Button>
          </form>
        )}
      </section>

      <section
        aria-label="Resumo do pedido"
        className="space-y-2 border-t border-dashed border-border pt-4"
      >
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatarPreco(subtotal)}</span>
        </div>
        {desconto > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Desconto</span>
            <span className="text-primary">−{formatarPreco(desconto)}</span>
          </div>
        )}
        <div className="flex items-end justify-between border-t border-dashed border-border pt-3">
          <span className="font-display text-lg text-foreground">Total</span>
          <span className="font-display text-2xl text-foreground">
            {formatarPreco(total)}
          </span>
        </div>
      </section>

      <div className="fixed bottom-16 left-0 right-0 z-20 border-t border-border bg-card px-4 py-3 md:bottom-0">
        <div className="mx-auto w-full max-w-2xl">
          <Button
            size="lg"
            className="h-12 w-full text-sm font-bold uppercase tracking-wide"
            onClick={() => navigate('/checkout')}
          >
            Continuar
          </Button>
        </div>
      </div>

      <Dialog open={confirmarLimpar} onOpenChange={setConfirmarLimpar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              Esvaziar o carrinho?
            </DialogTitle>
            <DialogDescription>
              Você vai perder os itens selecionados. Essa ação não tem volta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmarLimpar(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                limpar()
                setConfirmarLimpar(false)
                toast.success('Carrinho esvaziado.')
              }}
            >
              Esvaziar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
