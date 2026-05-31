import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Flame,
  Leaf,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useSacola, useSessao, useLojaAtiva } from '@/hooks'
import { listarCatalogoUnidade } from '@/services/catalogoApi'
import type { Categoria, Produto } from '@/features/cardapio/types'
import { formatarPreco } from '@/lib/formatadores'
import { cn } from '@/lib/utils'

const ATALHOS: { id: Categoria; rotulo: string; cor: string }[] = [
  { id: 'cafe-da-manha', rotulo: 'Manhã', cor: 'from-brand-indigo/90 to-brand-indigo' },
  { id: 'tapiocas', rotulo: 'Tapiocas', cor: 'from-brand-coral/90 to-brand-coral' },
  { id: 'cuscuz', rotulo: 'Cuscuz', cor: 'from-brand-verde/90 to-brand-verde' },
  { id: 'bolos', rotulo: 'Bolos', cor: 'from-brand-noite/80 to-brand-indigo' },
  { id: 'bebidas', rotulo: 'Bebidas', cor: 'from-secondary/90 to-brand-coral' },
  { id: 'promocoes', rotulo: 'Ofertas', cor: 'from-amber-500 to-brand-coral' },
]

const OFERTAS = [
  { produtoId: 'P06', tag: 'Quentinho', desconto: '−12%' },
  { produtoId: 'P30', tag: 'Combo', desconto: 'Duplo' },
  { produtoId: 'P19', tag: 'Regional', desconto: 'Destaque' },
]

export default function Home() {
  const navigate = useNavigate()
  const { perfil } = useSessao()
  const { lojaAtiva } = useLojaAtiva()
  const { adicionarItem } = useSacola()
  const [catalogo, setCatalogo] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!lojaAtiva) {
      navigate('/selecionar-unidade', { replace: true })
      return
    }
    setCarregando(true)
    listarCatalogoUnidade(lojaAtiva.id)
      .then(setCatalogo)
      .finally(() => setCarregando(false))
  }, [lojaAtiva, navigate])

  const ofertas = OFERTAS.map((o) => ({
    ...o,
    produto: catalogo.find((p) => p.id === o.produtoId),
  })).filter((x): x is typeof x & { produto: Produto } => Boolean(x.produto))

  const destaques = catalogo.filter((p) => p.tags.includes('mais-pedido')).slice(0, 4)
  const primeiroNome = perfil?.nome.split(' ')[0] ?? 'viajante'

  function incluirRapido(produto: Produto) {
    if (produto.customizacoes?.some((c) => c.obrigatoria)) {
      navigate(`/cardapio/produto/${produto.id}`)
      return
    }
    adicionarItem(produto, 1, {})
    toast.success(`${produto.nome} entrou na sacola`, {
      action: { label: 'Abrir sacola', onClick: () => navigate('/carrinho') },
    })
  }

  return (
    <div className="pb-8">
      {/* Hero em duas colunas */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-indigo via-brand-indigo to-brand-noite px-4 py-10 text-white md:px-8 md:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-brand-coral/20 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Leaf className="size-3.5" aria-hidden />
              Clube Pequi — 2 pts a cada R$ 1
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
              {primeiroNome}, o cerrado chegou na sua mesa.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-white/80 md:text-base">
              Peça agora em{' '}
              <strong className="text-white">{lojaAtiva?.nome ?? 'sua unidade'}</strong>
              . Retirada rápida no balcão e benefícios em pedidos acima de R$ 50.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand-coral text-white hover:bg-brand-coral/90"
              >
                <Link to="/cardapio">
                  Ver cardápio completo
                  <ArrowRight className="ml-2 size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link to="/fidelidade">Clube Pequi</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl border border-white/20 shadow-2xl md:block">
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"
              alt="Xícara de café coado fumegante"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-noite/90 to-transparent p-5">
              <p className="font-display text-lg">Café coado na hora</p>
              <p className="text-xs text-white/70">Disponível nesta unidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Banner principal */}
      <section className="mx-auto mt-6 max-w-6xl px-4 md:px-8">
        <Link
          to="/cardapio/promocoes"
          className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-md transition hover:shadow-lg md:flex-row"
        >
          <div className="relative aspect-[21/9] flex-1 bg-brand-areia md:aspect-auto md:min-h-[180px]">
            <img
              src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=80"
              alt=""
              className="h-full w-full object-cover opacity-90 transition group-hover:scale-[1.02]"
            />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand-coral px-3 py-1 text-xs font-bold text-white">
              <Flame className="size-3.5" aria-hidden />
              Semana do forró
            </span>
          </div>
          <div className="flex flex-col justify-center gap-2 p-6 md:max-w-sm">
            <h2 className="font-display text-2xl text-foreground">
              Combo junino com 15% off
            </h2>
            <p className="text-sm text-muted-foreground">
              Cuscuz, caldo de cana e curau — válido enquanto durarem os estoques da unidade.
            </p>
            <span className="mt-2 inline-flex items-center text-sm font-semibold text-primary">
              Explorar ofertas
              <ArrowRight className="ml-1 size-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </section>

      {/* Categorias — faixa horizontal */}
      <section className="mx-auto mt-10 max-w-6xl px-4 md:px-8" aria-label="Navegue por categorias">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl text-foreground">Por onde começar?</h2>
          <Link to="/cardapio" className="text-sm font-medium text-primary hover:underline">
            Tudo
          </Link>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          {ATALHOS.map(({ id, rotulo, cor }) => (
            <Link
              key={id}
              to={`/cardapio/${id}`}
              className={cn(
                'flex min-w-[120px] shrink-0 flex-col gap-3 rounded-2xl bg-gradient-to-br p-4 text-white shadow-md transition hover:scale-[1.02]',
                cor,
              )}
            >
              <span className="font-display text-lg font-semibold">{rotulo}</span>
              <span className="text-[11px] uppercase tracking-wider text-white/80">
                Ver itens
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promoções — grid bento */}
      <section className="mx-auto mt-10 max-w-6xl px-4 md:px-8" aria-label="Promoções da unidade">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-5 text-secondary" aria-hidden />
          <h2 className="font-display text-2xl text-foreground">Escolhas do dia</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {carregando &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
            ))}
          {!carregando &&
            ofertas.map(({ produto, tag, desconto }, idx) => (
              <article
                key={produto.id}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
                  idx === 0 && 'sm:col-span-2 lg:col-span-1 lg:row-span-1',
                )}
              >
                <div className={cn('relative', idx === 0 ? 'aspect-[2/1]' : 'aspect-video')}>
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-noite/80 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-indigo">
                      {tag}
                    </span>
                    <span className="rounded-md bg-brand-coral px-2 py-0.5 text-[10px] font-bold text-white">
                      {desconto}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="font-display text-lg">{produto.nome}</h3>
                    <p className="line-clamp-1 text-xs text-white/75">{produto.descricao}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold">{formatarPreco(produto.preco)}</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => incluirRapido(produto)}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </section>

      {/* Destaques + unidade */}
      <section className="mx-auto mt-10 max-w-6xl px-4 md:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="size-5 text-accent" aria-hidden />
              <h2 className="font-display text-xl text-foreground">Mais pedidos agora</h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {!carregando &&
                destaques.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/cardapio/produto/${p.id}`}
                      className="flex gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/30 hover:shadow-md"
                    >
                      <img
                        src={p.imagem}
                        alt=""
                        className="size-16 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">{p.nome}</p>
                        <p className="text-sm text-primary">{formatarPreco(p.preco)}</p>
                      </div>
                      <Star className="size-4 shrink-0 text-amber-500" aria-hidden />
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
          {lojaAtiva && (
            <aside className="rounded-2xl border border-border bg-muted/50 p-5">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 text-primary" aria-hidden />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Você está em
                  </p>
                  <p className="font-display text-lg text-foreground">{lojaAtiva.nome}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{lojaAtiva.endereco}</p>
                  {!lojaAtiva.cozinhaCompleta && (
                    <p className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-xs text-foreground">
                      Cardápio enxuto nesta loja — alguns pratos aparecem como indisponíveis.
                    </p>
                  )}
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link to="/selecionar-unidade">Trocar unidade</Link>
              </Button>
            </aside>
          )}
        </div>
      </section>
    </div>
  )
}
