import { useSessao } from '@/hooks'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Mail, Phone, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { FormField } from '@/components/molecules/FormField'
import {
  mascararCPF,
  mascararTelefone,
  validarCPF,
  validarEmail,
} from '@/lib/validators'

interface FormState {
  nome: string
  email: string
  telefone: string
  cpf: string
  nascimento: string
}

interface Erros {
  nome?: string
  email?: string
  telefone?: string
  cpf?: string
  nascimento?: string
}

export default function EditarPerfil() {
  const navigate = useNavigate()
  const usuario = useSessao().perfil
  const setPerfilCliente = useSessao().definirPerfil

  const [form, setForm] = useState<FormState>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    nascimento: '',
  })
  const [erros, setErros] = useState<Erros>({})
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!usuario) {
      navigate('/login', { replace: true })
      return
    }
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone ?? '',
      cpf: usuario.cpf ?? '',
      nascimento: usuario.dataNascimento ?? '',
    })
  }, [usuario, navigate])

  function setCampo<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function validar(): Erros {
    const e: Erros = {}
    if (form.nome.trim().length < 3) e.nome = 'Informe seu nome completo.'
    if (!validarEmail(form.email)) e.email = 'E-mail inválido.'
    if (form.telefone.replace(/\D/g, '').length < 10)
      e.telefone = 'Telefone incompleto.'
    if (form.cpf && !validarCPF(form.cpf)) e.cpf = 'CPF inválido.'
    if (!form.nascimento) e.nascimento = 'Informe a data de nascimento.'
    return e
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!usuario) return
    const e = validar()
    setErros(e)
    if (Object.keys(e).length) return

    setSalvando(true)
    window.setTimeout(() => {
      setPerfilCliente({
        ...usuario,
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        cpf: form.cpf || undefined,
        dataNascimento: form.nascimento,
      })
      setSalvando(false)
      toast.success('Perfil atualizado.')
      navigate('/conta')
    }, 600)
  }

  if (!usuario) return null

  return (
    <main className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-background px-3 py-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link to="/conta">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="font-display text-lg text-foreground">Editar perfil</h1>
      </header>

      <div className="mx-auto w-full max-w-md px-5 md:max-w-lg md:px-6">
        <p className="mt-2 text-sm text-muted-foreground">
          Atualize seus dados pessoais. Pra mudar senha ou consentimentos LGPD,
          vá em{' '}
          <Link to="/conta/privacidade" className="underline hover:text-foreground">
            Privacidade e dados
          </Link>
          .
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <FormField
            label="Nome completo"
            name="nome"
            value={form.nome}
            onChange={(e) => setCampo('nome', e.target.value)}
            erro={erros.nome}
            icone={<User className="size-4" />}
            autoComplete="name"
            required
          />
          <FormField
            label="E-mail"
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => setCampo('email', e.target.value)}
            erro={erros.email}
            icone={<Mail className="size-4" />}
            autoComplete="email"
            required
          />
          <FormField
            label="Telefone"
            type="tel"
            name="telefone"
            value={form.telefone}
            onChange={(e) =>
              setCampo('telefone', mascararTelefone(e.target.value))
            }
            erro={erros.telefone}
            icone={<Phone className="size-4" />}
            autoComplete="tel"
            required
          />
          <FormField
            label="CPF"
            name="cpf"
            value={form.cpf}
            onChange={(e) => setCampo('cpf', mascararCPF(e.target.value))}
            erro={erros.cpf}
            icone={<FileText className="size-4" />}
            hint="Opcional — usado no programa de fidelidade"
            inputMode="numeric"
          />
          <FormField
            label="Data de nascimento"
            type="date"
            name="nascimento"
            value={form.nascimento}
            onChange={(e) => setCampo('nascimento', e.target.value)}
            erro={erros.nascimento}
            required
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1"
              onClick={() => navigate('/conta')}
            >
              Cancelar
            </Button>
            <Button type="submit" className="h-12 flex-1" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
