export type ChaveConsentimento =
  | 'cookiesAnaliticos'
  | 'marketing'
  | 'geolocalizacao'
  | 'perfilConsumo'

export interface DescricaoConsentimento {
  chave: ChaveConsentimento
  titulo: string
  descricao: string
  /** Se true, é parte dos cookies — controlado pelo banner */
  cookieRelacionado?: boolean
}

export const CONSENTIMENTOS: DescricaoConsentimento[] = [
  {
    chave: 'cookiesAnaliticos',
    titulo: 'Cookies analíticos',
    descricao:
      'Métricas anônimas que nos ajudam a entender como você usa o app e melhorar o que está pegando mal.',
    cookieRelacionado: true,
  },
  {
    chave: 'marketing',
    titulo: 'Comunicações de marketing',
    descricao:
      'Promoções, lançamentos sazonais e novidades das unidades por e-mail e push. Você pode revogar a qualquer momento.',
  },
  {
    chave: 'geolocalizacao',
    titulo: 'Geolocalização',
    descricao:
      'Usamos só pra sugerir a unidade mais próxima e estimar tempo de retirada. Não compartilhamos com terceiros.',
  },
  {
    chave: 'perfilConsumo',
    titulo: 'Análise de perfil de consumo',
    descricao:
      'Permite recomendar produtos com base no seu histórico. Desligar não afeta o uso do app.',
  },
]
