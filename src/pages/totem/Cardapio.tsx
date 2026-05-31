import { useLojaAtiva, useSacola } from '@/hooks'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Cake,
  Clock,
  Coffee,
  CupSoda,
  Plus,
  ShoppingBasket,
  Soup,
  Sparkles,
  Wheat,
  X,
  type LucideIcon,
} from 'lucide-react'

import { CordelDivider } from '@/components/molecules/CordelDivider'
import { listarCatalogoUnidade } from '@/services/catalogoApi'
import {
  CATEGORIAS,
  type Categoria,
  type OpcaoCustomizacao,
  type Produto,
} from '@/features/cardapio/types'
import { cn } from '@/lib/utils'

const ICONE_CATEGORIA: Record<Categoria, LucideIcon> = {
  'cafe-da-manha': Coffee,
  tapiocas: Wheat,
  cuscuz: Soup,
  bolos: Cake,
  bebidas: CupSoda,
  promocoes: Sparkles,
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function Cardapio() {
  const navigate = useNavigate()
  const unidadeAtual = useLojaAtiva().lojaAtiva
  const adicionar = useSacola().adicionarItem
  const itens = useSacola().itens
  const { qtdItens, total } = useSacola().totais

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria>('tapiocas')
  const [agora, setAgora] = useState(() => new Date())

  useEffect(() => {
    if (!unidadeAtual) return
    setCarregando(true)
    listarCatalogoUnidade(unidadeAtual.id)
      .then(setProdutos)
      .finally(() => setCarregando(false))
  }, [unidadeAtual])

  useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const horaTexto = `${pad(agora.getHours())}:${pad(agora.getMinutes())}`

  const filtrados = useMemo(
    () => produtos.filter((p) => p.categoria === categoriaAtiva),
    [produtos, categoriaAtiva],
  )

  const contagensCategoria = useMemo(() => {
    const map = new Map<Categoria, number>()
    produtos.forEach((p) => map.set(p.categoria, (map.get(p.categoria) ?? 0) + 1))
    return map
  }, [produtos])

  function adicionarProduto(produto: Produto) {
    if (produto.customizacoes?.some((c) => c.obrigatoria)) {
      const selecoes: Record<string, OpcaoCustomizacao[]> = {}
      produto.customizacoes.forEach((c) => {
        if (c.obrigatoria && c.opcoes[0]) selecoes[c.id] = [c.opcoes[0]]
      })
      adicionar(produto, 1, selecoes)
    } else {
      adicionar(produto, 1, {})
    }
  }

  function cancelarPedido() {
    navigate('/totem', { replace: true })
  }

  if (!unidadeAtual) {
    return (
      <div className="grid h-full place-items-center px-12 text-center">
        <p className="text-[28px] text-muted-foreground">
          Totem sem unidade configurada.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Faixa superior fina com botão Cancelar pedido */}
      <div className="flex h-10 flex-none items-center justify-end border-b border-[rgba(61,40,23,0.06)] bg-white px-8">
        <button
          type="button"
          onClick={cancelarPedido}
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
            Sertanejão {unidadeAtual.nome}
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
          <button
            type="button"
            onClick={() => navigate('/totem/carrinho')}
            aria-label={`Carrinho com ${qtdItens} ${qtdItens === 1 ? 'item' : 'itens'}`}
            className="relative grid size-20 place-items-center rounded-2xl border-2 border-[rgba(61,40,23,0.12)] bg-[#F2EBE0] text-foreground transition-transform active:scale-95"
          >
            <ShoppingBasket className="size-[38px]" aria-hidden strokeWidth={2} />
            {qtdItens > 0 && (
              <span className="absolute -right-2.5 -top-2.5 inline-flex h-9 min-w-9 items-center justify-center rounded-full border-[3px] border-white bg-primary px-2.5 text-[20px] font-bold text-white shadow-[0_1px_2px_rgba(61,40,23,0.06)]">
                {qtdItens}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* BODY: rail + grid */}
      <div className="grid flex-1 grid-cols-[300px_1fr] overflow-hidden">
        {/* Categorias laterais */}
        <nav
          aria-label="Categorias"
          className="flex flex-col gap-5 overflow-y-auto border-r border-[rgba(61,40,23,0.12)] bg-white p-2.5 py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIAS.map((c) => {
            const Icone = ICONE_CATEGORIA[c.id]
            const ativa = c.id === categoriaAtiva
            const count = contagensCategoria.get(c.id) ?? 0
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoriaAtiva(c.id)}
                aria-current={ativa}
                className={cn(
                  'flex h-[100px] w-[280px] flex-none cursor-pointer items-center gap-[18px] rounded-2xl border-l-4 px-[22px] text-left transition-transform active:scale-[0.98]',
                  ativa
                    ? 'border-l-primary bg-primary text-white shadow-[0_6px_0_0_#8a3520,0_4px_12px_rgba(61,40,23,0.08)]'
                    : 'border-l-[#3D2817] bg-[#F2EBE0] text-foreground',
                )}
              >
                <span
                  className={cn(
                    'inline-flex size-[52px] flex-none items-center justify-center rounded-[14px]',
                    ativa
                      ? 'bg-white/20 text-white'
                      : 'bg-[rgba(61,40,23,0.08)] text-foreground',
                  )}
                >
                  <Icone className="size-7" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <div
                    style={{ fontFamily: '"Playfair Display", serif' }}
                    className="mb-1 text-[22px] font-bold leading-[1.1]"
                  >
                    {c.nome}
                  </div>
                  <div
                    className={cn(
                      'text-[14px] leading-none',
                      ativa ? 'text-white/80' : 'text-muted-foreground',
                    )}
                  >
                    {count} {count === 1 ? 'item' : 'itens'}
                  </div>
                </span>
              </button>
            )
          })}
        </nav>

        {/* Grid */}
        <main className="flex flex-col overflow-y-auto px-10 pb-8 pt-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mb-6 flex items-end justify-between gap-6">
            <h1
              style={{ fontFamily: '"Playfair Display", serif' }}
              className="text-[56px] font-bold leading-none tracking-[-0.02em] text-primary"
            >
              {CATEGORIAS.find((c) => c.id === categoriaAtiva)?.nome}
            </h1>
            <p className="pb-1.5 text-right text-[18px] leading-[1.3] text-muted-foreground">
              {filtrados.length} sabores · feitos na hora
              <br />
              <strong className="font-bold text-foreground">
                Sem glúten
              </strong>{' '}
              por natureza
            </p>
          </div>
          <CordelDivider className="mb-7" />

          {carregando && (
            <ul className="grid grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <li
                  key={i}
                  className="h-[440px] animate-pulse rounded-[20px] bg-[#F2EBE0]"
                  aria-hidden
                />
              ))}
            </ul>
          )}

          {!carregando && filtrados.length === 0 && (
            <p className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-[24px] text-muted-foreground">
              Nada nesta categoria nesta unidade.
            </p>
          )}

          {!carregando && filtrados.length > 0 && (
            <ul className="grid grid-cols-2 gap-8">
              {filtrados.map((p) => {
                const noCarrinho = itens
                  .filter((it) => it.produto.id === p.id)
                  .reduce((acc, it) => acc + it.quantidade, 0)
                const tag = p.tags.includes('mais-pedido')
                  ? { texto: 'Mais pedido', cor: 'bg-secondary text-foreground' }
                  : p.tags.includes('sazonal-junino')
                    ? { texto: 'Junino', cor: 'bg-[#4A6741] text-white' }
                    : null
                return (
                  <li key={p.id}>
                    <article className="relative flex flex-col overflow-hidden rounded-[20px] border border-[rgba(61,40,23,0.12)] bg-white shadow-[0_1px_2px_rgba(61,40,23,0.06)] transition-transform active:scale-[0.98]">
                      <div className="relative h-[220px] w-full overflow-hidden">
                        <img
                          src={p.imagem}
                          alt={p.nome}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.30),transparent_60%)]"
                        />
                        {tag && (
                          <span
                            className={cn(
                              'absolute left-3.5 top-3.5 z-[2] rounded-md px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.08em] shadow-[0_1px_2px_rgba(61,40,23,0.06)]',
                              tag.cor,
                            )}
                          >
                            {tag.texto}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-2.5 px-[22px] pt-5">
                        <h3 className="line-clamp-2 min-h-[52px] text-[22px] font-bold leading-[1.18] text-foreground">
                          {p.nome}
                        </h3>
                        <div
                          style={{ fontFamily: '"Playfair Display", serif' }}
                          className="mt-auto pb-4 text-[44px] font-bold leading-none tracking-[-0.01em] text-primary"
                        >
                          <small className="mr-1 align-baseline text-[24px] font-semibold">
                            R$
                          </small>
                          {p.preco.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => adicionarProduto(p)}
                        aria-label={`Adicionar ${p.nome}`}
                        className="inline-flex h-[72px] w-full items-center justify-center gap-2.5 border-t border-black/5 bg-primary text-[20px] font-bold uppercase tracking-[0.08em] text-white transition-colors active:scale-[0.98] active:bg-[#A6331B]"
                      >
                        <Plus className="size-[22px]" aria-hidden strokeWidth={3} />
                        Adicionar
                      </button>
                      {noCarrinho > 0 && (
                        <span className="absolute right-3 top-3 z-10 rounded-full bg-[#4A6741] px-3 py-1 text-[14px] font-bold text-white shadow-md">
                          {noCarrinho} no carrinho
                        </span>
                      )}
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </main>
      </div>

      {/* BOTTOM BAR 120px */}
      <footer className="flex h-[120px] flex-none items-center justify-between gap-8 border-t border-[rgba(61,40,23,0.12)] bg-white px-10 shadow-[0_-4px_16px_rgba(61,40,23,0.06)]">
        <div className="flex items-center gap-5">
          <div
            className="relative grid size-16 flex-none place-items-center rounded-2xl bg-primary/10 text-primary"
            aria-hidden
          >
            <ShoppingBasket className="size-8" />
            {qtdItens > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-secondary px-2 text-[16px] font-bold text-foreground">
                {qtdItens}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="text-[14px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Seu pedido
            </span>
            <span
              style={{ fontFamily: '"Playfair Display", serif' }}
              className="text-[36px] font-bold tracking-[-0.02em] text-foreground"
            >
              <small className="mr-1 text-[22px] font-semibold text-muted-foreground">
                R$
              </small>
              {total.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/totem/carrinho')}
          disabled={qtdItens === 0}
          className="inline-flex h-20 w-[480px] items-center justify-center gap-3.5 rounded-2xl bg-primary text-[24px] font-extrabold uppercase tracking-[0.10em] text-white shadow-[0_6px_0_0_#8a3520,0_4px_12px_rgba(61,40,23,0.08)] transition-transform active:translate-y-[3px] active:shadow-[0_3px_0_0_#8a3520] disabled:cursor-not-allowed disabled:bg-[#d9cfc2] disabled:shadow-none"
        >
          Finalizar pedido
          <ArrowRight className="size-7" aria-hidden strokeWidth={2.5} />
        </button>
      </footer>
    </>
  )
}
