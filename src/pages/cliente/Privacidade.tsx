import { usePreferenciasPrivacidade } from '@/hooks'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronRight,
  Download,
  FileText,
  Info,
  Pencil,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { apagarDadosTitular, exportarPacoteTitular } from '@/services/privacidadeApi'
import { CONSENTIMENTOS } from '@/features/lgpd/types'
import { cn } from '@/lib/utils'

function formatarData(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Privacidade() {
  const {
    cookiesAnaliticos,
    marketing,
    geolocalizacao,
    perfilConsumo,
    dataAtualizacao,
    atualizarPreferencia,
  } = usePreferenciasPrivacidade()
  const consentimentos = {
    cookiesAnaliticos,
    marketing,
    geolocalizacao,
    perfilConsumo,
  }

  const [confirmar1, setConfirmar1] = useState(false)
  const [confirmar2, setConfirmar2] = useState(false)
  const [textoConfirmacao, setTextoConfirmacao] = useState('')

  function handleExportar() {
    exportarPacoteTitular()
    toast.success('Download iniciado', {
      description: 'Arquivo JSON com tudo que sabemos sobre você.',
    })
  }

  function handleExcluir() {
    apagarDadosTitular()
  }

  return (
    <section className="space-y-6 px-4 py-6 md:px-8">
      <header className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link to="/conta">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="font-display text-2xl text-foreground md:text-3xl">
          Privacidade e dados
        </h1>
      </header>

      <article className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden
          />
          <div>
            <h2 className="font-display text-base text-foreground">
              Você controla seus dados
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Conforme a Lei Geral de Proteção de Dados (LGPD), você pode rever,
              corrigir, exportar ou excluir suas informações a qualquer momento.
            </p>
          </div>
        </div>
      </article>

      <section aria-labelledby="meus-consentimentos">
        <h2
          id="meus-consentimentos"
          className="mb-3 font-display text-xl text-foreground"
        >
          Meus consentimentos
        </h2>
        <ul className="space-y-2">
          {CONSENTIMENTOS.map((c) => {
            const ativo = consentimentos[c.chave]
            return (
              <li key={c.chave}>
                <label
                  className={cn(
                    'flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 shadow-sm transition-colors',
                    ativo
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {c.titulo}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c.descricao}
                    </p>
                  </div>
                  <Toggle
                    checked={ativo}
                    onChange={(v) => {
                      atualizarPreferencia(c.chave, v)
                      toast.success(
                        v
                          ? `${c.titulo}: permitido`
                          : `${c.titulo}: revogado`,
                      )
                    }}
                    label={c.titulo}
                  />
                </label>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="direitos-lgpd">
        <h2
          id="direitos-lgpd"
          className="mb-3 font-display text-xl text-foreground"
        >
          Seus direitos LGPD
        </h2>
        <ul className="space-y-2">
          <LinhaAcao
            icone={Download}
            titulo="Exportar meus dados"
            descricao="Receba um arquivo JSON com tudo que armazenamos sobre você (Art. 18, V)."
            onClick={handleExportar}
          />
          <LinhaAcao
            icone={Pencil}
            titulo="Corrigir meus dados"
            descricao="Atualize informações incompletas ou incorretas."
            href="/conta/editar"
          />
          <LinhaAcao
            icone={FileText}
            titulo="Política de Privacidade"
            descricao="Como coletamos, usamos e protegemos suas informações."
            href="/politica-privacidade"
          />
          <LinhaAcao
            icone={FileText}
            titulo="Termos de Uso"
            descricao="Regras de uso do app e do programa de fidelidade."
            href="/termos-uso"
          />
          <LinhaAcao
            icone={Info}
            titulo="Como tratamos seus dados"
            descricao="Detalhes sobre cada finalidade e tempo de retenção."
            href="/politica-privacidade#tratamento"
          />
        </ul>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setConfirmar1(true)}
            className="flex w-full items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left shadow-sm transition-colors hover:bg-destructive/10"
          >
            <Trash2
              className="mt-0.5 size-5 shrink-0 text-destructive"
              aria-hidden
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-destructive">
                Excluir minha conta
              </p>
              <p className="mt-0.5 text-xs text-destructive/80">
                Remove permanentemente seu perfil, pedidos, pontos e histórico.
                Essa ação é irreversível.
              </p>
            </div>
            <ChevronRight
              className="mt-0.5 size-5 shrink-0 text-destructive"
              aria-hidden
            />
          </button>
        </div>
      </section>

      <p className="text-center text-xs italic text-muted-foreground">
        Última atualização do consentimento: {formatarData(dataAtualizacao)}
      </p>

      {/* Confirmação dupla */}
      <Dialog open={confirmar1} onOpenChange={setConfirmar1}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Excluir minha conta?</DialogTitle>
            <DialogDescription>
              Vamos apagar permanentemente: perfil, pedidos, pontos de
              fidelidade, carrinho atual e consentimentos. Não tem como
              recuperar depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setConfirmar1(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmar1(false)
                setConfirmar2(true)
              }}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmar2}
        onOpenChange={(open) => {
          setConfirmar2(open)
          if (!open) setTextoConfirmacao('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              Última verificação
            </DialogTitle>
            <DialogDescription>
              Pra confirmar, digite <strong>EXCLUIR</strong> abaixo. Depois
              disso, sua conta vai embora pra sempre.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={textoConfirmacao}
            onChange={(e) => setTextoConfirmacao(e.target.value)}
            placeholder="Digite EXCLUIR"
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setConfirmar2(false)
                setTextoConfirmacao('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={textoConfirmacao.trim() !== 'EXCLUIR'}
              onClick={handleExcluir}
            >
              Excluir agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
        checked ? 'border-primary bg-primary' : 'border-border bg-muted',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-card shadow-sm transition-all',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
        aria-hidden
      />
    </button>
  )
}

interface LinhaAcaoProps {
  icone: LucideIcon
  titulo: string
  descricao: string
  href?: string
  onClick?: () => void
}

function LinhaAcao({ icone: Icone, titulo, descricao, href, onClick }: LinhaAcaoProps) {
  const conteudo = (
    <>
      <Icone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">{titulo}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{descricao}</p>
      </div>
      <ChevronRight
        className="mt-0.5 size-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </>
  )

  const className =
    'flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40'

  if (href) {
    if (href.startsWith('/') && !href.includes('#')) {
      return (
        <li>
          <Link to={href} className={className}>
            {conteudo}
          </Link>
        </li>
      )
    }
    return (
      <li>
        <a href={href} className={className}>
          {conteudo}
        </a>
      </li>
    )
  }

  return (
    <li>
      <button type="button" onClick={onClick} className={className}>
        {conteudo}
      </button>
    </li>
  )
}

