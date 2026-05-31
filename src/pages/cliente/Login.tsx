import { useSessao } from '@/hooks'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FormField } from '@/components/molecules/FormField'
import { entrarComCredenciais } from '@/services/sessaoApi'
import { validarEmail, validarSenha } from '@/lib/validators'

interface Erros {
  email?: string
  senha?: string
}

export default function Login() {
  const navigate = useNavigate()
  const setPerfilCliente = useSessao().definirPerfil
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState<Erros>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  function validar(): Erros {
    const e: Erros = {}
    if (!validarEmail(email)) e.email = 'Informe um e-mail válido.'
    if (!validarSenha(senha))
      e.senha = 'A senha precisa ter ao menos 6 caracteres.'
    return e
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    setErroGeral(null)
    const e = validar()
    setErros(e)
    if (Object.keys(e).length) return

    setEnviando(true)
    const usuario = await entrarComCredenciais(email, senha)
    setEnviando(false)

    if (!usuario) {
      setErroGeral('E-mail ou senha incorretos.')
      return
    }

    setPerfilCliente(usuario)
    navigate('/selecionar-unidade', { replace: true })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-7 rounded-2xl bg-card p-6 shadow-lg md:p-8">
        <header className="space-y-3 text-center">
          <div className="mx-auto size-20 rounded-full bg-primary" aria-hidden />
          <h1 className="font-display text-3xl text-foreground">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-muted-foreground">
            O sabor da nossa terra espera por você.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormField
            label="E-mail"
            type="email"
            name="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            erro={erros.email}
            icone={<Mail className="size-4" />}
            autoComplete="email"
            required
          />
          <FormField
            label="Senha"
            type="password"
            name="senha"
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            erro={erros.senha}
            icone={<Lock className="size-4" />}
            autoComplete="current-password"
            required
          />

          <div className="-mt-2 flex justify-end">
            <Link
              to="/login"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Esqueci minha senha
            </Link>
          </div>

          {erroGeral && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {erroGeral}
            </p>
          )}

          <Button type="submit" className="h-12 w-full" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{' '}
          <Link
            to="/cadastro"
            className="font-medium text-primary hover:underline"
          >
            Cadastre-se
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          Ao entrar, você aceita os{' '}
          <Link
            to="/conta/privacidade"
            className="text-primary hover:underline"
          >
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link
            to="/conta/privacidade"
            className="text-primary hover:underline"
          >
            Política de Privacidade
          </Link>
          .
        </p>

        <p className="rounded-md bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
          Conta de demonstração: <code className="font-mono">beatriz@cerrado.demo</code> /
          <code className="ml-1 font-mono">cerrado123</code>
        </p>
      </div>
    </main>
  )
}
