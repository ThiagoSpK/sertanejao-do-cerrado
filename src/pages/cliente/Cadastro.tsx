import { useSessao } from '@/hooks'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Lock, Mail, Phone, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FormField } from '@/components/molecules/FormField'
import {
  LGPDConsents,
  type ValoresConsentimento,
} from '@/features/lgpd/LGPDConsents'
import { registrarPerfil, emailJaCadastrado } from '@/services/sessaoApi'
import {
  mascararCPF,
  mascararTelefone,
  validarCPF,
  validarEmail,
  validarSenha,
} from '@/lib/validators'

interface FormState extends ValoresConsentimento {
  nome: string
  email: string
  telefone: string
  cpf: string
  nascimento: string
  senha: string
  confirmar: string
}

const INICIAL: FormState = {
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  nascimento: '',
  senha: '',
  confirmar: '',
  termos: false,
  marketing: false,
  analisePerfil: false,
}

interface Erros {
  nome?: string
  email?: string
  telefone?: string
  cpf?: string
  nascimento?: string
  senha?: string
  confirmar?: string
}

export default function Cadastro() {
  const navigate = useNavigate()
  const setPerfilCliente = useSessao().definirPerfil
  const [form, setForm] = useState<FormState>(INICIAL)
  const [erros, setErros] = useState<Erros>({})
  const [enviando, setEnviando] = useState(false)

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
    if (!validarSenha(form.senha, 8))
      e.senha = 'A senha precisa ter ao menos 8 caracteres.'
    if (form.senha !== form.confirmar)
      e.confirmar = 'As senhas não conferem.'
    return e
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault()
    const e = validar()
    if (emailJaCadastrado(form.email)) {
      e.email = 'Este e-mail já está cadastrado.'
    }
    setErros(e)
    if (Object.keys(e).length) return

    setEnviando(true)
    window.setTimeout(() => {
      const novoPerfilCliente = {
        id: 'u-' + Date.now().toString(36),
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        cpf: form.cpf || undefined,
        dataNascimento: form.nascimento,
        consentimentos: {
          marketing: form.marketing,
          analisePerfil: form.analisePerfil,
        },
        criadoEm: new Date().toISOString(),
      }
      const ok = registrarPerfil(novoPerfilCliente, form.senha)
      setEnviando(false)
      if (!ok) {
        // Race condition rara — outro registro chegou no localStorage entre validate e submit.
        setErros({ email: 'Este e-mail já está cadastrado.' })
        return
      }
      setPerfilCliente(novoPerfilCliente)
      navigate('/selecionar-unidade', { replace: true })
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-10 flex items-center bg-background px-3 py-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link to="/onboarding">
            <ArrowLeft />
          </Link>
        </Button>
      </header>

      <div className="mx-auto w-full max-w-md px-5 md:max-w-lg md:px-6">
        <section className="space-y-3 text-center">
          <div
            className="mx-auto size-20 rounded-full bg-primary"
            aria-hidden
          />
          <h1 className="font-display text-3xl text-foreground">Criar conta</h1>
          <p className="mx-auto max-w-xs text-sm text-muted-foreground">
            Junte-se a nós e descubra os verdadeiros sabores do Nordeste.
          </p>
        </section>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <FormField
            label="Nome completo"
            name="nome"
            placeholder="Ex: Maria da Silva"
            value={form.nome}
            onChange={(e) => setCampo('nome', e.target.value)}
            erro={erros.nome}
            icone={<User className="size-4" />}
            autoComplete="name"
            required
          />
          <div>
            <FormField
              label="E-mail"
              type="email"
              name="email"
              placeholder="exemplo@email.com"
              value={form.email}
              onChange={(e) => setCampo('email', e.target.value)}
              erro={erros.email}
              icone={<Mail className="size-4" />}
              autoComplete="email"
              required
            />
            {erros.email === 'Este e-mail já está cadastrado.' && (
              <Link
                to="/login"
                className="mt-1.5 inline-block text-xs font-semibold text-primary hover:underline"
              >
                Fazer login →
              </Link>
            )}
          </div>
          <FormField
            label="Telefone"
            type="tel"
            name="telefone"
            placeholder="(00) 00000-0000"
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
            placeholder="000.000.000-00"
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
          <FormField
            label="Senha"
            type="password"
            name="senha"
            placeholder="Mínimo 8 caracteres"
            value={form.senha}
            onChange={(e) => setCampo('senha', e.target.value)}
            erro={erros.senha}
            icone={<Lock className="size-4" />}
            autoComplete="new-password"
            required
          />
          <FormField
            label="Confirmar senha"
            type="password"
            name="confirmar"
            placeholder="Repita sua senha"
            value={form.confirmar}
            onChange={(e) => setCampo('confirmar', e.target.value)}
            erro={erros.confirmar}
            icone={<Lock className="size-4" />}
            autoComplete="new-password"
            required
          />

          <LGPDConsents
            valores={{
              termos: form.termos,
              marketing: form.marketing,
              analisePerfil: form.analisePerfil,
            }}
            onChange={(campo, valor) => setCampo(campo, valor)}
          />

          <Button
            type="submit"
            className="h-12 w-full"
            disabled={!form.termos || enviando}
          >
            {enviando ? 'Criando conta…' : 'Criar conta'}
          </Button>
        </form>
      </div>
    </main>
  )
}
