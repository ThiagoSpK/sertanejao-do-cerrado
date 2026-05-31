const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarEmail(email: string): boolean {
  return RE_EMAIL.test(email.trim())
}

export function validarSenha(senha: string, minimo = 6): boolean {
  return senha.length >= minimo
}

export function validarCPF(cpf: string): boolean {
  const digitos = cpf.replace(/\D/g, '')
  if (digitos.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digitos)) return false

  const calcular = (slice: string, fatorInicial: number): number => {
    let soma = 0
    for (let i = 0; i < slice.length; i++) {
      soma += Number(slice[i]) * (fatorInicial - i)
    }
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  const dv1 = calcular(digitos.slice(0, 9), 10)
  const dv2 = calcular(digitos.slice(0, 10), 11)
  return dv1 === Number(digitos[9]) && dv2 === Number(digitos[10])
}

export function mascararCPF(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function mascararTelefone(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
