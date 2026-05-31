export type Categoria =
  | 'cafe-da-manha'
  | 'tapiocas'
  | 'cuscuz'
  | 'bolos'
  | 'bebidas'
  | 'promocoes'

export type Tag =
  | 'vegetariano'
  | 'sem-gluten'
  | 'mais-pedido'
  | 'sazonal-junino'
  | 'doce'
  | 'salgado'
  | 'combo'
  | 'tradicional'
  | 'regional'
  | 'gelado'
  | 'quente'

export type Alergenico =
  | 'leite'
  | 'ovo'
  | 'gluten'
  | 'crustaceos'
  | 'peixe'
  | 'amendoim'
  | 'soja'

export interface OpcaoCustomizacao {
  id: string
  nome: string
  precoExtra: number
}

export interface Customizacao {
  id: string
  nome: string
  tipo: 'unica' | 'multipla'
  obrigatoria: boolean
  opcoes: OpcaoCustomizacao[]
}

export interface Produto {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria: Categoria
  imagem: string
  tags: Tag[]
  unidades: string[]
  customizacoes?: Customizacao[]
  alergenicos: Alergenico[]
}

export const CATEGORIAS: { id: Categoria; nome: string }[] = [
  { id: 'cafe-da-manha', nome: 'Café da manhã' },
  { id: 'tapiocas', nome: 'Tapiocas' },
  { id: 'cuscuz', nome: 'Cuscuz' },
  { id: 'bolos', nome: 'Bolos' },
  { id: 'bebidas', nome: 'Bebidas' },
  { id: 'promocoes', nome: 'Promoções' },
]

export const ROTULOS_TAG: Record<Tag, string> = {
  vegetariano: 'Vegetariano',
  'sem-gluten': 'Sem glúten',
  'mais-pedido': 'Mais pedido',
  'sazonal-junino': 'Junino',
  doce: 'Doce',
  salgado: 'Salgado',
  combo: 'Combo',
  tradicional: 'Tradicional',
  regional: 'Regional',
  gelado: 'Gelado',
  quente: 'Quente',
}

export const ROTULOS_ALERGENICO: Record<Alergenico, string> = {
  leite: 'Leite',
  ovo: 'Ovo',
  gluten: 'Glúten',
  crustaceos: 'Crustáceos',
  peixe: 'Peixe',
  amendoim: 'Amendoim',
  soja: 'Soja',
}
