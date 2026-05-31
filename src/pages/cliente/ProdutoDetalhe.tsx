import { useLojaAtiva, useSacola } from '@/hooks'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { obterItemCatalogo } from '@/services/catalogoApi'
import {
  ROTULOS_ALERGENICO,
  ROTULOS_TAG,
  type Customizacao,
  type OpcaoCustomizacao,
  type Produto,
} from '@/features/cardapio/types'
import { formatarPreco } from '@/lib/formatadores'
import { cn } from '@/lib/utils'

type Selecoes = Record<string, OpcaoCustomizacao[]>

function selecaoInicial(produto: Produto): Selecoes {
  const inicial: Selecoes = {}
  produto.customizacoes?.forEach((c) => {
    if (c.tipo === 'unica' && c.obrigatoria && c.opcoes[0]) {
      inicial[c.id] = [c.opcoes[0]]
    } else {
      inicial[c.id] = []
    }
  })
  return inicial
}

function calcularUnitario(produto: Produto, selecoes: Selecoes): number {
  const extras = Object.values(selecoes)
    .flat()
    .reduce((acc, o) => acc + o.precoExtra, 0)
  return produto.preco + extras
}

function alternarMultipla(
  atuais: OpcaoCustomizacao[],
  opcao: OpcaoCustomizacao,
): OpcaoCustomizacao[] {
  if (atuais.some((o) => o.id === opcao.id)) {
    return atuais.filter((o) => o.id !== opcao.id)
  }
  return [...atuais, opcao]
}

export default function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const unidadeAtual = useLojaAtiva().lojaAtiva
  const adicionar = useSacola().adicionarItem

  const [produto, setProduto] = useState<Produto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [selecoes, setSelecoes] = useState<Selecoes>({})
  const [observacoes, setObservacoes] = useState('')
  const [quantidade, setQuantidade] = useState(1)

  useEffect(() => {
    if (!id) {
      navigate('/cardapio', { replace: true })
      return
    }
    setCarregando(true)
    obterItemCatalogo(id)
      .then((p) => {
        if (!p) {
          toast.error('Produto não encontrado')
          navigate('/cardapio', { replace: true })
          return
        }
        if (unidadeAtual && !p.unidades.includes(unidadeAtual.id)) {
          toast.error(`Indisponível em ${unidadeAtual.nome}`)
          navigate('/cardapio', { replace: true })
          return
        }
        setProduto(p)
        setSelecoes(selecaoInicial(p))
      })
      .finally(() => setCarregando(false))
  }, [id, unidadeAtual, navigate])

  const unitario = useMemo(
    () => (produto ? calcularUnitario(produto, selecoes) : 0),
    [produto, selecoes],
  )
  const totalCarrinho = unitario * quantidade

  const obrigatoriasOk =
    !produto?.customizacoes ||
    produto.customizacoes
      .filter((c) => c.obrigatoria)
      .every((c) => (selecoes[c.id]?.length ?? 0) > 0)

  function handleSelecionar(c: Customizacao, opcao: OpcaoCustomizacao) {
    setSelecoes((prev) => {
      const atual = prev[c.id] ?? []
      const novo =
        c.tipo === 'unica' ? [opcao] : alternarMultipla(atual, opcao)
      return { ...prev, [c.id]: novo }
    })
  }

  function handleAdicionar() {
    if (!produto || !obrigatoriasOk) return
    adicionar(produto, quantidade, selecoes, observacoes)
    toast.success(
      `${quantidade}× ${produto.nome} adicionado${quantidade > 1 ? 's' : ''}`,
    )
    navigate('/carrinho')
  }

  if (carregando) {
    return (
      <section className="space-y-4 p-4 md:p-8">
        <div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted md:aspect-[16/9]" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
      </section>
    )
  }

  if (!produto) return null

  return (
    <section className="pb-44 md:pb-32">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted md:aspect-[21/9]">
        <img
          src={produto.imagem}
          alt={produto.nome}
          className="h-full w-full object-cover"
        />
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="absolute left-3 top-3 size-11 rounded-full bg-card text-foreground shadow-sm hover:bg-card"
          aria-label="Voltar ao cardápio"
        >
          <Link to="/cardapio">
            <ArrowLeft />
          </Link>
        </Button>
      </div>

      <div className="-mt-6 rounded-t-3xl bg-background px-4 pt-6 md:px-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl text-foreground md:text-3xl">
            {produto.nome}
          </h1>
          <span className="whitespace-nowrap font-display text-xl text-primary md:text-2xl">
            {formatarPreco(produto.preco)}
          </span>
        </div>

        {produto.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {produto.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                {ROTULOS_TAG[tag]}
              </span>
            ))}
          </div>
        )}

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {produto.descricao}
        </p>

        {produto.alergenicos.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Contém:</strong>{' '}
            {produto.alergenicos.map((a) => ROTULOS_ALERGENICO[a]).join(', ')}.
          </p>
        )}

        {produto.customizacoes && produto.customizacoes.length > 0 && (
          <div className="mt-8 space-y-6">
            <h2 className="font-display text-xl text-foreground">
              Personalize seu pedido
            </h2>
            {produto.customizacoes.map((c) => {
              const selectedIds = (selecoes[c.id] ?? []).map((o) => o.id)
              return (
                <fieldset key={c.id}>
                  <legend className="text-sm font-semibold text-foreground">
                    {c.nome}
                    {c.obrigatoria && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-primary">
                        Obrigatório
                      </span>
                    )}
                  </legend>
                  <div className="mt-2 space-y-2">
                    {c.opcoes.map((opcao) => {
                      const checked = selectedIds.includes(opcao.id)
                      return (
                        <label
                          key={opcao.id}
                          className={cn(
                            'flex min-h-11 cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors',
                            checked
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-card hover:border-primary/40',
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type={c.tipo === 'unica' ? 'radio' : 'checkbox'}
                              name={`cust-${c.id}`}
                              checked={checked}
                              onChange={() => handleSelecionar(c, opcao)}
                              className="size-5 accent-primary"
                            />
                            <span className="text-sm text-foreground">
                              {opcao.nome}
                            </span>
                          </span>
                          <span
                            className={cn(
                              'text-xs font-bold',
                              opcao.precoExtra > 0
                                ? 'text-primary'
                                : 'text-muted-foreground',
                            )}
                          >
                            {opcao.precoExtra > 0
                              ? `+ ${formatarPreco(opcao.precoExtra)}`
                              : 'Grátis'}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              )
            })}
          </div>
        )}

        <div className="mt-8">
          <label
            htmlFor="observacoes"
            className="text-sm font-semibold text-foreground"
          >
            Observações
          </label>
          <textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: tirar cebola, ponto da carne..."
            rows={3}
            maxLength={200}
            className="mt-2 w-full resize-none rounded-xl border border-input bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {observacoes.length}/200
          </p>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-20 border-t border-border bg-card px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:bottom-0">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              disabled={quantidade <= 1}
              className="grid size-11 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-40"
              aria-label="Diminuir quantidade"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span
              className="min-w-[2ch] text-center font-display text-2xl text-foreground"
              aria-live="polite"
            >
              {quantidade}
            </span>
            <button
              type="button"
              onClick={() => setQuantidade((q) => Math.min(20, q + 1))}
              className="grid size-11 place-items-center rounded-full border border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label="Aumentar quantidade"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          <Button
            type="button"
            size="lg"
            disabled={!obrigatoriasOk}
            onClick={handleAdicionar}
            className="h-12 w-full text-sm font-bold uppercase tracking-wide"
          >
            Adicionar ao carrinho · {formatarPreco(totalCarrinho)}
          </Button>
        </div>
      </div>
    </section>
  )
}
