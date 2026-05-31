export interface ConsentimentosConta {
  marketing: boolean
  analisePerfil: boolean
}

export interface PerfilCliente {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
  dataNascimento?: string
  consentimentos: ConsentimentosConta
  criadoEm: string
}
