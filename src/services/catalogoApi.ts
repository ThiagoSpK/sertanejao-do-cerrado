import cardapioMock from '@/mocks/cardapio.json'
import { comLatencia } from '@/lib/latencia'
import type { Categoria, Produto } from '@/features/cardapio/types'

const PRODUTOS = cardapioMock as Produto[]

export async function listarCatalogoUnidade(
  unidadeId: string,
): Promise<Produto[]> {
  const filtrados = PRODUTOS.filter((p) => p.unidades.includes(unidadeId))
  return comLatencia(filtrados)
}

export async function obterItemCatalogo(
  produtoId: string,
): Promise<Produto | null> {
  const produto = PRODUTOS.find((p) => p.id === produtoId) ?? null
  return comLatencia(produto)
}

export interface ItemCatalogoComStatus {
  produto: Produto
  disponivel: boolean
}

export async function listarCatalogoComDisponibilidade(
  unidadeId: string,
): Promise<ItemCatalogoComStatus[]> {
  const lista = PRODUTOS.map((produto) => ({
    produto,
    disponivel: produto.unidades.includes(unidadeId),
  }))
  return comLatencia(lista)
}

export interface FiltrosBuscaCatalogo {
  unidadeId?: string
  categoria?: Categoria
}

export async function pesquisarCatalogo(
  termo: string,
  filtros: FiltrosBuscaCatalogo = {},
): Promise<Produto[]> {
  const t = termo.trim().toLowerCase()
  let resultados = PRODUTOS

  if (filtros.unidadeId) {
    resultados = resultados.filter((p) =>
      p.unidades.includes(filtros.unidadeId!),
    )
  }
  if (filtros.categoria) {
    resultados = resultados.filter((p) => p.categoria === filtros.categoria)
  }
  if (t) {
    resultados = resultados.filter((p) => {
      const blob = `${p.nome} ${p.descricao} ${p.tags.join(' ')}`.toLowerCase()
      return blob.includes(t)
    })
  }

  return comLatencia(resultados)
}
