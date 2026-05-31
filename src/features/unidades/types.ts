export interface HorariosFuncionamento {
  segundaSexta: string
  sabado: string
  domingo: string
}

export interface Unidade {
  id: string
  nome: string
  endereco: string
  telefone: string
  lat: number
  lng: number
  horarios: HorariosFuncionamento
  cozinhaCompleta: boolean
  produtosDisponiveis: string[]
}
