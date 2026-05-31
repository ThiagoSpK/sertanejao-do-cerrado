import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Filter, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLojaAtiva, useSacola } from '@/hooks'
import { listarCatalogoComDisponibilidade } from '@/services/catalogoApi'
import {
  CATEGORIAS,
  ROTULOS_TAG,
  type Categoria,
  type Produto,
  type Tag,
} from '@/features/cardapio/types'
import { formatarPreco } from '@/lib/formatadores'
import { cn } from '@/lib/utils'

type FiltroTag = 'todos' | Tag

const FILTROS: { id: FiltroTag; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Tudo' },
  { id: 'salgado', rotulo: 'Salgados' },
  { id: 'doce', rotulo: 'Doces' },
  { id: 'sem-gluten', rotulo: 'Sem glúten' },
  { id: 'vegetariano', rotulo: 'Vegetariano' },
  { id: 'mais-pedido', rotulo: 'Populares' },
]

function categoriaValida(v: string | undefined): v is Categoria {
  return Boolean(v && CATEGORIAS.some((c) => c.id === v))
}

export default function Cardapio() {
  const { categoria } = useParams<{ categoria: string }>()
  const navigate = useNavigate()
  const { lojaAtiva } = useLojaAtiva()
  const { adicionarItem } = useSacola()

  const [itens, setItens] = useState<
    Awaited<ReturnType<typeof listarCatalogoComDisponibilidade>>
  >([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<FiltroTag>('todos')
  const [buscaAberta, setBuscaAberta] = useState(false)

  const catAtiva = categoriaValida(categoria) ? categoria : null
  const titulo =
    CATEGORIAS.find((c) => c.id === catAtiva)?.nome ?? 'Cardápio completo'

  useEffect(() => {
    if (!lojaAtiva) {
      navigate('/selecionar-unidade', { replace: true })
      return
    }
    setCarregando(true)
    listarCatalogoComDisponibilidade(lojaAtiva.id)
      .then(setItens)
      .finally(() => setCarregando(false))
  }, [lojaAtiva, navigate])

  useEffect(() => {
    setFiltro('todos')
  }, [catAtiva])

  const visiveis = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return itens.filter(({ produto }) => {
      if (catAtiva && produto.categoria !== catAtiva) return false
      if (filtro !== 'todos' && !produto.tags.includes(filtro)) return false
      if (t) {
        const blob = `${produto.nome} ${produto.descricao} ${produto.tags.join(' ')}`.toLowerCase()
        if (!blob.includes(t)) return false
      }
      return true
    })
  }, [itens, catAtiva, filtro, busca])

  function incluir(produto: Produto) {
    if (produto.customizacoes?.some((c) => c.obrigatoria)) {
      navigate(`/cardapio/produto/${produto.id}`)
      return
    }
    adicionarItem(produto, 1, {})
    toast.success(`${produto.nome} adicionado`, {
      action: { label: 'Sacola', onClick: () => navigate('/carrinho') },
    })
  }

  return (
    <div className="min-h-[60vh] pb-8">
      {/* Cabeçalho sticky com filtros horizontais */}
      <div className="sticky top-[59px] z-20 border-b border-border bg-brand-areia">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <nav className="text-xs text-muted-foreground" aria-label="Trilha">
                <Link to="/home" className="hover:text-foreground">
                  Início
                </Link>
                <span aria-hidden> · </span>
                <span className="text-foreground">{titulo}</span>
              </nav>
              <h1 className="mt-1 font-display text-3xl text-foreground">{titulo}</h1>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Abrir busca avançada"
              onClick={() => setBuscaAberta(true)}
            >
              <Search className="size-4" />
            </Button>
          </div>

          {/* Categorias horizontais */}
          <div
            className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Categorias"
          >
            <Link
              to="/cardapio"
              role="tab"
              aria-selected={!catAtiva}
              className={cn(
                'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition',
                !catAtiva
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              Todos
            </Link>
            {CATEGORIAS.map((c) => (
              <Link
                key={c.id}
                to={`/cardapio/${c.id}`}
                role="tab"
                aria-selected={catAtiva === c.id}
                className={cn(
                  'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition',
                  catAtiva === c.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {c.nome}
              </Link>
            ))}
          </div>

          {/* Filtros horizontais secundários */}
          <div
            className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Filtros rápidos"
          >
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                  filtro === f.id
                    ? 'border-secondary bg-secondary text-secondary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40',
                )}
              >
                {f.id === 'todos' ? (
                  <SlidersHorizontal className="size-3" aria-hidden />
                ) : (
                  <Filter className="size-3" aria-hidden />
                )}
                {f.rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de cards verticais */}
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8">
        <p className="mb-4 text-sm text-muted-foreground">
          {carregando ? 'Carregando…' : `${visiveis.length} itens encontrados`}
        </p>

        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {carregando &&
            Array.from({ length: 8 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              </li>
            ))}

          {!carregando && visiveis.length === 0 && (
            <li className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="font-display text-lg text-foreground">Nada nesta combinação</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Limpe os filtros ou experimente outra categoria.
              </p>
              <Button variant="link" className="mt-2" onClick={() => setFiltro('todos')}>
                Limpar filtros
              </Button>
            </li>
          )}

          {!carregando &&
            visiveis.map(({ produto, disponivel }) => (
              <li key={produto.id}>
                <article
                  className={cn(
                    'group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition',
                    disponivel
                      ? 'hover:-translate-y-0.5 hover:shadow-lg'
                      : 'opacity-55',
                  )}
                >
                  <Link
                    to={disponivel ? `/cardapio/produto/${produto.id}` : '#'}
                    onClick={(e) => !disponivel && e.preventDefault()}
                    className="relative block aspect-square overflow-hidden bg-muted"
                  >
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                      className={cn(
                        'h-full w-full object-cover transition group-hover:scale-105',
                        !disponivel && 'grayscale',
                      )}
                      loading="lazy"
                    />
                    {produto.tags.includes('mais-pedido') && (
                      <span className="absolute left-2 top-2 rounded-md bg-brand-coral px-2 py-0.5 text-[10px] font-bold text-white">
                        {ROTULOS_TAG['mais-pedido']}
                      </span>
                    )}
                    {!disponivel && (
                      <span className="absolute inset-0 flex items-center justify-center bg-brand-noite/50 text-xs font-bold uppercase tracking-wider text-white">
                        Esgotado
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-3">
                    <Link
                      to={disponivel ? `/cardapio/produto/${produto.id}` : '#'}
                      className="font-display text-sm font-semibold leading-snug text-foreground hover:text-primary"
                    >
                      {produto.nome}
                    </Link>
                    <p className="mt-1 line-clamp-2 flex-1 text-[11px] text-muted-foreground">
                      {produto.descricao}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-primary">
                        {formatarPreco(produto.preco)}
                      </span>
                      {disponivel && (
                        <button
                          type="button"
                          onClick={() => incluir(produto)}
                          className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                          aria-label={`Adicionar ${produto.nome}`}
                        >
                          <Plus className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            ))}
        </ul>
      </div>

      {/* Overlay de busca */}
      {buscaAberta && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-brand-noite/60 p-4 pt-20 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Busca no cardápio"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                autoFocus
                type="search"
                placeholder="Digite o prato, ingrediente ou tag…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-base outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setBusca('')
                  setBuscaAberta(false)
                }}
                aria-label="Fechar busca"
              >
                <X className="size-5" />
              </button>
            </div>
            <ul className="max-h-[50vh] divide-y divide-border overflow-y-auto">
              {visiveis.slice(0, 8).map(({ produto }) => (
                <li key={produto.id}>
                  <Link
                    to={`/cardapio/produto/${produto.id}`}
                    onClick={() => setBuscaAberta(false)}
                    className="flex items-center gap-3 p-3 hover:bg-muted"
                  >
                    <img
                      src={produto.imagem}
                      alt=""
                      className="size-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{produto.nome}</p>
                      <p className="text-xs text-muted-foreground">{formatarPreco(produto.preco)}</p>
                    </div>
                  </Link>
                </li>
              ))}
              {busca && visiveis.length === 0 && (
                <li className="p-6 text-center text-sm text-muted-foreground">
                  Nenhum resultado para &quot;{busca}&quot;
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
