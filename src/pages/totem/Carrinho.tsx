import { precoLinhaSacola, useLojaAtiva, useSacola } from '@/hooks'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Minus,
  Plus,
  ShoppingBasket,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { CordelDivider } from '@/components/molecules/CordelDivider'
import { validarVoucher } from '@/services/voucherApi'
import { cn } from '@/lib/utils'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

import type { ItemCarrinho } from '@/features/carrinho/types'

function resumirSelecoes(item: ItemCarrinho) {
  const partes = Object.values(item.selecoes).flat().map((o) => o.nome)
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
  const { qtdItens, subtotal, desconto, total } = useSacola().totais
  const unidadeAtual = useLojaAtiva().lojaAtiva

  const [agora, setAgora] = useState(() => new Date())
  const [cupomAberto, setCupomAberto] = useState(false)
  const [codigoCupom, setCodigoCupom] = useState('')

  useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const horaTexto = `${pad(agora.getHours())}:${pad(agora.getMinutes())}`

  async function handleAplicar() {
    if (!codigoCupom.trim()) return
    const r = await validarVoucher(codigoCupom)
    if (r.valido) {
      aplicarCupom(r.cupom)
      toast.success(`Cupom ${r.cupom.codigo} aplicado`)
      setCodigoCupom('')
    } else {
      toast.error('Cupom inválido')
    }
  }

  // Empty state
  if (itens.length === 0) {
    return (
      <>
        <header className="flex h-[120px] flex-none items-center justify-between border-b border-[rgba(61,40,23,0.12)] bg-white px-10">
          <div className="flex items-center gap-4">
            <div
              className="grid size-[72px] place-items-center rounded-2xl bg-primary text-primary-foreground"
              aria-hidden
            >
              <span style={{ fontFamily: '"Playfair Display", serif' }} className="text-5xl font-bold leading-none">
                R
              </span>
            </div>
            <div
              style={{ fontFamily: '"Playfair Display", serif' }}
              className="text-[28px] font-bold leading-none text-foreground"
            >
              Sertanejão {unidadeAtual?.nome}
            </div>
          </div>
        </header>

        <section className="grid flex-1 place-items-center px-12 py-16 text-center">
          <div className="max-w-[680px] space-y-8">
            <div
              className="mx-auto grid size-40 place-items-center rounded-full bg-primary/10 text-primary"
              aria-hidden
            >
              <ShoppingBasket className="size-20" />
            </div>
            <h1
              style={{ fontFamily: '"Playfair Display", serif' }}
              className="text-[64px] font-bold leading-tight text-primary"
            >
              Carrinho vazio
            </h1>
            <p className="text-[28px] text-muted-foreground">
              Que tal começar pelas tapiocas? Tem coalho, carne de sol e
              charque esperando.
            </p>
            <button
              type="button"
              onClick={() => navigate('/totem/cardapio')}
              className="mx-auto inline-flex h-[100px] w-[600px] items-center justify-center rounded-2xl bg-primary text-[26px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_6px_0_0_#8a3520]"
            >
              Ver cardápio
            </button>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      {/* Faixa superior fina com botão Cancelar pedido */}
      <div className="flex h-10 flex-none items-center justify-end border-b border-[rgba(61,40,23,0.06)] bg-white px-8">
        <button
          type="button"
          onClick={() => navigate('/totem', { replace: true })}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-[14px] font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-destructive"
        >
          <X className="size-3.5" aria-hidden strokeWidth={2.5} />
          Cancelar pedido
        </button>
      </div>

      {/* HEADER principal 120px */}
      <header className="grid h-[120px] flex-none grid-cols-[1fr_auto_1fr] items-center border-b border-[rgba(61,40,23,0.12)] bg-white px-8">
        <div className="flex items-center gap-4">
          <div
            className="grid size-[72px] place-items-center rounded-2xl bg-primary text-primary-foreground"
            aria-hidden
          >
            <span style={{ fontFamily: '"Playfair Display", serif' }} className="text-5xl font-bold leading-none">
              R
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="mb-1.5 text-[16px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Unidade
          </div>
          <div
            style={{ fontFamily: '"Playfair Display", serif' }}
            className="text-[32px] font-bold leading-none tracking-[-0.02em] text-foreground"
          >
            Sertanejão {unidadeAtual?.nome}
          </div>
        </div>
        <div className="flex items-center justify-end gap-6">
          <div
            style={{ fontFamily: '"Playfair Display", serif' }}
            className="inline-flex items-center gap-2.5 text-[28px] font-semibold leading-none text-foreground"
          >
            <Clock className="size-6 text-muted-foreground" aria-hidden />
            <span className="tabular-nums">{horaTexto}</span>
          </div>
          <div className="relative grid size-20 place-items-center rounded-2xl border-2 border-[rgba(61,40,23,0.12)] bg-[#F2EBE0]">
            <ShoppingBasket className="size-[38px]" aria-hidden strokeWidth={2} />
            <span className="absolute -right-2.5 -top-2.5 inline-flex h-9 min-w-9 items-center justify-center rounded-full border-[3px] border-white bg-primary px-2.5 text-[20px] font-bold text-white">
              {qtdItens}
            </span>
          </div>
        </div>
      </header>

      {/* TITLE SECTION 200px */}
      <section className="flex h-[200px] flex-none flex-col justify-center px-20">
        <h1
          style={{ fontFamily: '"Playfair Display", serif' }}
          className="text-[64px] font-bold leading-none tracking-[-0.02em] text-primary"
        >
          Seu pedido
        </h1>
        <p className="mt-3 text-[28px] text-muted-foreground">
          Confira antes de pagar
        </p>
        <CordelDivider className="mt-5" />
      </section>

      {/* ITEMS LIST */}
      <section className="flex-1 overflow-y-auto px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex flex-col gap-5">
          {itens.map((item) => {
            const unit = precoLinhaSacola(item)
            const sublabel = resumirSelecoes(item)
            return (
              <li key={item.itemId}>
                <article className="flex h-[300px] w-[1000px] gap-6 rounded-[20px] border border-[rgba(61,40,23,0.12)] bg-white p-6 shadow-[0_1px_2px_rgba(61,40,23,0.06)]">
                  <div className="size-60 flex-none overflow-hidden rounded-2xl bg-[#F2EBE0]">
                    <img
                      src={item.produto.imagem}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex w-[550px] flex-1 flex-col">
                    <h3 className="text-[32px] font-bold leading-tight text-foreground">
                      {item.produto.nome}
                    </h3>
                    {sublabel && (
                      <p className="mt-2 line-clamp-2 text-[24px] leading-snug text-muted-foreground">
                        {sublabel}
                      </p>
                    )}
                    <p className="mt-auto text-[28px] text-foreground">
                      {unit.toFixed(2).replace('.', ',')} cada
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          atualizarQuantidade(item.itemId, item.quantidade - 1)
                        }
                        aria-label="Diminuir"
                        className="grid size-20 place-items-center rounded-2xl border-[3px] border-primary bg-white text-primary transition-transform active:scale-95"
                      >
                        <Minus className="size-9" aria-hidden strokeWidth={3} />
                      </button>
                      <span
                        style={{ fontFamily: '"Playfair Display", serif' }}
                        className="min-w-[2ch] text-center text-[48px] font-bold tabular-nums text-foreground"
                        aria-live="polite"
                      >
                        {item.quantidade}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          atualizarQuantidade(item.itemId, item.quantidade + 1)
                        }
                        aria-label="Aumentar"
                        className="grid size-20 place-items-center rounded-2xl bg-primary text-white shadow-[0_4px_0_0_#8a3520] transition-transform active:translate-y-0.5"
                      >
                        <Plus className="size-9" aria-hidden strokeWidth={3} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remover(item.itemId)}
                      aria-label={`Remover ${item.produto.nome}`}
                      className="inline-flex items-center gap-2 px-3 py-2 text-[20px] font-semibold uppercase tracking-[0.05em] text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="size-6" aria-hidden />
                      Remover
                    </button>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>

        {/* Cupom */}
        <div className="mt-6">
          {!cupom && !cupomAberto && (
            <button
              type="button"
              onClick={() => setCupomAberto(true)}
              className="flex h-[120px] w-[1000px] items-center gap-5 rounded-2xl border-2 border-dashed border-[#8C716B] bg-white px-8 text-[24px] font-semibold text-foreground transition-colors hover:border-primary hover:bg-[rgba(200,75,49,0.05)]"
            >
              <Tag className="size-9 text-primary" aria-hidden />
              + Adicionar cupom de desconto
            </button>
          )}

          {!cupom && cupomAberto && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleAplicar()
              }}
              className="flex h-[120px] w-[1000px] items-center gap-4 rounded-2xl border-2 border-primary bg-white px-6"
            >
              <Tag className="size-9 text-primary" aria-hidden />
              <input
                type="text"
                value={codigoCupom}
                onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
                placeholder="Digite o código"
                autoFocus
                className="h-16 flex-1 border-none bg-transparent text-[28px] font-semibold uppercase text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="inline-flex h-16 items-center justify-center rounded-xl bg-primary px-8 text-[20px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_4px_0_0_#8a3520]"
              >
                Aplicar
              </button>
              <button
                type="button"
                onClick={() => {
                  setCupomAberto(false)
                  setCodigoCupom('')
                }}
                aria-label="Fechar cupom"
                className="grid size-16 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
              >
                <X className="size-7" aria-hidden />
              </button>
            </form>
          )}

          {cupom && (
            <div className="flex h-[120px] w-[1000px] items-center gap-5 rounded-2xl border-2 border-[#4A6741] bg-[#4A6741]/5 px-8">
              <Tag className="size-9 text-[#4A6741]" aria-hidden />
              <div className="flex-1">
                <span className="rounded-full bg-[#4A6741] px-3 py-1 text-[16px] font-bold uppercase tracking-[0.05em] text-white">
                  {cupom.codigo}
                </span>
                <p className="mt-1.5 text-[20px] text-foreground">
                  Desconto aplicado: −R$ {desconto.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  removerCupom()
                  toast.success('Cupom removido')
                }}
                aria-label="Remover cupom"
                className="grid size-16 place-items-center rounded-xl text-[#4A6741] hover:bg-[#4A6741]/10"
              >
                <X className="size-7" aria-hidden />
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        <section
          aria-label="Resumo"
          className="mt-8 flex h-[240px] w-[1000px] flex-col justify-center gap-4 rounded-2xl bg-[#F2EBE0] px-10 py-8"
        >
          <div className="flex items-center justify-between text-[32px]">
            <span className="text-foreground">Subtotal</span>
            <span className="text-foreground tabular-nums">
              R$ {subtotal.toFixed(2).replace('.', ',')}
            </span>
          </div>
          {desconto > 0 && (
            <div className="flex items-center justify-between text-[32px]">
              <span className="text-[#4A6741]">Desconto</span>
              <span className="text-[#4A6741] tabular-nums">
                −R$ {desconto.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
          <div
            className={cn(
              'flex items-end justify-between border-t-2 border-dashed border-[#3D2817]/20 pt-4',
              !desconto && 'mt-2',
            )}
          >
            <span
              style={{ fontFamily: '"Playfair Display", serif' }}
              className="text-[40px] font-bold text-foreground"
            >
              Total
            </span>
            <span
              style={{ fontFamily: '"Playfair Display", serif' }}
              className="text-[64px] font-bold leading-none tracking-[-0.02em] text-primary tabular-nums"
            >
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </section>

        <div className="h-8" aria-hidden />
      </section>

      {/* BOTTOM BAR 120px */}
      <footer className="flex h-[120px] flex-none items-center justify-center gap-6 border-t border-[rgba(61,40,23,0.12)] bg-white px-10 shadow-[0_-4px_16px_rgba(61,40,23,0.06)]">
        <button
          type="button"
          onClick={() => navigate('/totem/cardapio')}
          className="inline-flex h-[100px] w-[480px] items-center justify-center rounded-2xl border-[3px] border-primary bg-transparent text-[24px] font-bold uppercase tracking-[0.06em] text-primary transition-colors hover:bg-[rgba(200,75,49,0.06)] active:scale-[0.98]"
        >
          Continuar comprando
        </button>
        <button
          type="button"
          onClick={() => navigate('/totem/pagamento')}
          className="inline-flex h-[100px] w-[480px] items-center justify-center rounded-2xl bg-primary text-[24px] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_6px_0_0_#8a3520]"
        >
          Pagar R$ {total.toFixed(2).replace('.', ',')}
        </button>
      </footer>
    </>
  )
}
