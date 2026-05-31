import { PapelEquipe, ROTULOS_PAPEL, useEquipeOperacional } from '@/hooks'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ChefHat,
  Eye,
  EyeOff,
  Headset,
  Info,
  Lock,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OpcaoRole {
  id: PapelEquipe
  icon: LucideIcon
}

const ROLES: OpcaoRole[] = [
  { id: 'atendente', icon: Headset },
  { id: 'cozinha', icon: ChefHat },
  { id: 'gerente', icon: ShieldCheck },
]

export default function LoginAdmin() {
  const navigate = useNavigate()
  const usuario = useEquipeOperacional().membro
  const login = useEquipeOperacional().autenticarMembro

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [role, setRole] = useState<PapelEquipe>('atendente')
  const [mostrar, setMostrar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to={destinoPorRole(usuario.papel)} replace />

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)

    window.setTimeout(() => {
      const u = login(email, senha, role)
      setEnviando(false)
      if (!u) {
        setErro('Credenciais inválidas. Verifique e-mail e senha.')
        return
      }
      navigate(destinoPorRole(u.papel), { replace: true })
    }, 400)
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#3D2817] lg:grid-cols-2">
      {/* HERO esquerda */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-14 text-white lg:flex">
        {/* Texturas */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(45deg,transparent_0_7px,rgba(255,255,255,.05)_7px_8px),repeating-linear-gradient(-45deg,transparent_0_7px,rgba(255,255,255,.05)_7px_8px)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 500px at 110% -10%, rgba(225,161,64,.28), transparent 60%), radial-gradient(700px 500px at -10% 110%, rgba(61,40,23,.35), transparent 55%)',
          }}
        />

        <div className="relative z-10 flex items-center gap-4">
          <div
            className="grid size-14 place-items-center rounded-2xl bg-[#FAF6F1] text-primary shadow-md"
            aria-hidden
          >
            <span style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl font-bold">
              R
            </span>
          </div>
          <div className="leading-tight">
            <p style={{ fontFamily: '"Playfair Display", serif' }} className="text-xl font-bold">
              Sertanejão do Cerrado
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              Sabor que tem raiz
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <span className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur">
            <span className="size-2 rounded-full bg-secondary shadow-[0_0_0_4px_rgba(225,161,64,0.25)]" />
            Acesso interno
          </span>
          <h1
            style={{ fontFamily: '"Playfair Display", serif' }}
            className="text-5xl font-bold leading-[1.04] tracking-tight"
          >
            Painel de <em className="not-italic text-secondary">Operações</em>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/85">
            Acesso restrito aos colaboradores. Aqui a gente coordena cozinha,
            atendimento e gerência das nossas unidades.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs">
          <p className="text-white/60">
            © 2026 Sertanejão do Cerrado · Todos os direitos reservados
          </p>
          <div className="flex items-center gap-4 text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="size-3.5" aria-hidden /> Conexão segura
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wifi className="size-3.5" aria-hidden /> v3.2.1
            </span>
          </div>
        </div>
      </aside>

      {/* PAINEL direita */}
      <section className="relative flex flex-col items-center justify-center bg-background px-6 py-10">
        <p className="absolute right-6 top-6 text-xs text-muted-foreground">
          Não é colaborador?{' '}
          <a href="/" className="font-semibold text-primary hover:underline">
            Voltar ao site
          </a>
        </p>

        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Bem-vindo(a) de volta
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Faça login com suas credenciais.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="adm-email"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                E-mail corporativo
              </label>
              <div className="relative mt-1.5">
                <Mail
                  className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="adm-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@sertanejao.com"
                  autoComplete="username"
                  className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="adm-senha"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Senha
              </label>
              <div className="relative mt-1.5">
                <Lock
                  className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="adm-senha"
                  type={mostrar ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrar((s) => !s)}
                  aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-2 my-auto grid size-9 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {mostrar ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <fieldset>
              <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Papel no sistema
              </legend>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {ROLES.map(({ id, icon: Icon }) => {
                  const ativo = role === id
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={ativo}
                      onClick={() => setRole(id)}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors',
                        ativo
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      {ROTULOS_PAPEL[id]}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="size-3" aria-hidden /> Selecione seu papel para acessar o painel correto.
              </p>
            </fieldset>

            {erro && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {erro}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={enviando}
              className="h-12 w-full text-sm font-bold uppercase tracking-wider"
            >
              {enviando ? 'Entrando…' : 'Entrar'}
              {!enviando && <ArrowRight className="size-5" aria-hidden />}
            </Button>
          </form>

          <div className="mt-5 rounded-md border border-dashed border-border bg-muted/40 p-4">
            <div className="mb-2.5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-foreground">
              <span className="size-1.5 rounded-full bg-feedback-success shadow-[0_0_0_3px_rgba(46,125,50,0.18)]" />
              Credenciais de demonstração
            </div>
            <dl className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-1.5 text-xs">
              <dt className="font-bold uppercase tracking-wider text-muted-foreground">
                E-mail
              </dt>
              <dd className="font-mono text-foreground">
                <code className="rounded border border-border bg-card px-1.5 py-0.5">
                  atendente@sertanejao.com
                </code>
                ·{' '}
                <code className="rounded border border-border bg-card px-1.5 py-0.5">
                  cozinha@sertanejao.com
                </code>
                ·{' '}
                <code className="rounded border border-border bg-card px-1.5 py-0.5">
                  gerente@sertanejao.com
                </code>
              </dd>
              <dt className="font-bold uppercase tracking-wider text-muted-foreground">
                Senha
              </dt>
              <dd className="font-mono text-foreground">
                <code className="rounded border border-border bg-card px-1.5 py-0.5">
                  sertao123
                </code>
              </dd>
            </dl>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Em caso de problemas, contate o suporte:{' '}
          <a
            href="mailto:suporte@sertanejao.com"
            className="font-semibold text-primary hover:underline"
          >
            suporte@sertanejao.com
          </a>
        </p>
      </section>
    </div>
  )
}

function destinoPorRole(role: PapelEquipe): string {
  if (role === 'atendente') return '/admin/pdv'
  if (role === 'cozinha') return '/admin/kds'
  return '/admin/dashboard'
}
