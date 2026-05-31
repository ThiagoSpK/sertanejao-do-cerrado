import { useProgramaRaizes, useSessao } from '@/hooks'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Crown, Medal, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { listarBeneficiosPrograma } from '@/services/programaApi'
import {
  FAIXAS_NIVEL,
  pontosParaProximoNivel,
  nivelPorPontos,
  type Recompensa,
  type NivelFidelidade,
} from '@/features/fidelidade/types'
import { cn } from '@/lib/utils'

const ICONE_NIVEL: Record<NivelFidelidade, typeof Award> = {
  pequi: Medal,
  cagaita: Award,
  baru: Crown,
}

function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function Fidelidade() {
  const navigate = useNavigate()
  const usuario = useSessao().perfil
  const saldoPontos = useProgramaRaizes().saldoPontos
  const historico = useProgramaRaizes().historico
  const resgatar = useProgramaRaizes().resgatarBeneficio

  const [recompensas, setRecompensas] = useState<Recompensa[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    listarBeneficiosPrograma()
      .then(setRecompensas)
      .finally(() => setCarregando(false))
  }, [])

  const nivel = nivelPorPontos(saldoPontos)
  const Icone = ICONE_NIVEL[nivel]
  const proximo = pontosParaProximoNivel(saldoPontos)
  const nivelRotulo =
    FAIXAS_NIVEL.find((f) => f.nivel === nivel)?.rotulo ?? 'Pequi'

  function handleResgatar(r: Recompensa) {
    const cupom = resgatar(r)
    if (!cupom) {
      toast.error('Saldo insuficiente para essa recompensa.')
      return
    }
    toast.success(`Resgate aplicado: ${r.nome}`, {
      description: `Cupom ${cupom.codigo} já está no seu carrinho.`,
      action: {
        label: 'Ver carrinho',
        onClick: () => navigate('/carrinho'),
      },
    })
  }

  return (
    <section className="space-y-6 px-4 py-6 md:px-8">
      <header>
        <h1 className="font-display text-3xl text-foreground md:text-4xl">
          Clube Pequi
        </h1>
        {usuario && (
          <p className="mt-1 text-sm text-muted-foreground">
            Olá, {usuario.nome.split(' ')[0]} — 2 pontos por real gasto e +50 pts em
            pedidos acima de R$ 50.
          </p>
        )}
      </header>

      <article
        className={cn(
          'overflow-hidden rounded-2xl border p-6 shadow-md transition-colors',
          nivel === 'baru'
            ? 'border-secondary bg-gradient-to-br from-brand-indigo/20 via-card to-card'
            : nivel === 'cagaita'
              ? 'border-border bg-gradient-to-br from-brand-verde/15 via-card to-card'
              : 'border-border bg-gradient-to-br from-brand-coral/10 via-card to-card',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Seu nível
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Icone
                className={cn(
                  'size-7',
                  nivel === 'baru'
                    ? 'text-brand-indigo'
                    : nivel === 'cagaita'
                      ? 'text-brand-verde'
                      : 'text-brand-coral',
                )}
                aria-hidden
              />
              <h2 className="font-display text-2xl text-foreground">
                {nivelRotulo}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Saldo
            </p>
            <p className="font-display text-3xl text-foreground">{saldoPontos}</p>
            <p className="text-xs text-muted-foreground">
              {saldoPontos === 1 ? 'ponto' : 'pontos'}
            </p>
          </div>
        </div>

        {proximo ? (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Faltam <strong className="text-foreground">{proximo.faltam}</strong>{' '}
                pts pro {proximo.proximo}
              </span>
              <span className="text-muted-foreground">
                {Math.round(proximo.progresso * 100)}%
              </span>
            </div>
            <div
              className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(proximo.progresso * 100)}
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.round(proximo.progresso * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-5 flex items-center gap-2 text-sm text-secondary-foreground">
            <Sparkles className="size-4" aria-hidden />
            Nível máximo desbloqueado — desconto exclusivo em todas as compras.
          </p>
        )}
      </article>

      <section aria-labelledby="recompensas-titulo">
        <h2 id="recompensas-titulo" className="mb-3 font-display text-xl text-foreground">
          Recompensas disponíveis
        </h2>
        {carregando && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="aspect-[3/4] animate-pulse rounded-xl bg-muted"
                aria-hidden
              />
            ))}
          </ul>
        )}
        {!carregando && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {recompensas.map((r) => {
              const podeResgatar = saldoPontos >= r.custoPontos
              const faltam = r.custoPontos - saldoPontos
              return (
                <li key={r.id}>
                  <article
                    className={cn(
                      'flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow',
                      !podeResgatar && 'opacity-70',
                    )}
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={r.imagem}
                        alt={r.nome}
                        loading="lazy"
                        className={cn(
                          'h-full w-full object-cover',
                          !podeResgatar && 'grayscale',
                        )}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-3">
                      <h3 className="line-clamp-2 text-sm font-bold text-foreground">
                        {r.nome}
                      </h3>
                      <p className="text-xs font-bold text-primary">
                        {r.custoPontos} pts
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant={podeResgatar ? 'default' : 'outline'}
                        disabled={!podeResgatar}
                        onClick={() => handleResgatar(r)}
                        className="mt-auto h-9 text-xs uppercase tracking-wide"
                      >
                        {podeResgatar ? 'Resgatar' : `Faltam ${faltam} pts`}
                      </Button>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="historico-titulo">
        <h2 id="historico-titulo" className="mb-3 font-display text-xl text-foreground">
          Histórico
        </h2>
        {historico.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Sem movimentações ainda. Faça seu primeiro pedido pra começar a
            acumular pontos.
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
            {historico.slice(0, 10).map((mov) => (
              <li
                key={mov.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{mov.motivo}</p>
                  <p className="text-xs text-muted-foreground">
                    {dataCurta(mov.em)}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-1 text-xs font-bold',
                    mov.tipo === 'credito'
                      ? 'bg-feedback-success/15 text-feedback-success'
                      : 'bg-destructive/10 text-destructive',
                  )}
                >
                  {mov.tipo === 'credito' ? '+' : '−'}
                  {mov.pontos} pts
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-xs italic text-muted-foreground">
        Cada R$ 1,00 vira 1 ponto após o pedido ser retirado. Resgates valem
        por 24 horas e aparecem como cupom no carrinho.
      </p>
    </section>
  )
}
