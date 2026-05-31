import { useState, type ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Award, ChefHat, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Step {
  titulo: string
  descricao: string
  Icone: ComponentType<{ className?: string }>
  bg: string
  iconColor: string
}

const STEPS: Step[] = [
  {
    titulo: 'Peça pelo app, retire na loja',
    descricao:
      'Cardápio completo de cada unidade, direto na palma da sua mão.',
    Icone: ChefHat,
    bg: 'bg-primary',
    iconColor: 'text-primary-foreground',
  },
  {
    titulo: 'Acompanhe seu pedido em tempo real',
    descricao:
      'Saiba quando está em preparo e quando está pronto pra retirar — sem fila.',
    Icone: Clock,
    bg: 'bg-secondary',
    iconColor: 'text-secondary-foreground',
  },
  {
    titulo: 'Acumule pontos a cada pedido',
    descricao:
      'Resgate descontos e produtos. Quanto mais você pede, mais ganha.',
    Icone: Award,
    bg: 'bg-feedback-success',
    iconColor: 'text-white',
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const ultimo = step === STEPS.length - 1
  const atual = STEPS[step]
  const { Icone } = atual

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-end px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/login')}
          className="text-xs uppercase tracking-wider"
        >
          Pular
        </Button>
      </div>

      <section className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div
          className={cn(
            'mb-8 grid size-40 place-items-center rounded-3xl shadow-lg transition-colors',
            atual.bg,
          )}
        >
          <Icone className={cn('size-20', atual.iconColor)} />
        </div>

        <h1 className="font-display text-3xl text-foreground md:text-4xl">
          {atual.titulo}
        </h1>
        <p className="mt-3 max-w-sm text-base text-muted-foreground">
          {atual.descricao}
        </p>

        <div
          className="mt-8 flex gap-2"
          role="tablist"
          aria-label="Passos do onboarding"
        >
          {STEPS.map((_, i) => (
            <span
              key={i}
              role="tab"
              aria-selected={i === step}
              className={cn(
                'h-2 rounded-full transition-all',
                i === step ? 'w-8 bg-primary' : 'w-2 bg-border',
              )}
            />
          ))}
        </div>
      </section>

      <div className="space-y-3 px-8 pb-12 pt-4 md:mx-auto md:w-full md:max-w-sm">
        {ultimo ? (
          <>
            <Button
              size="lg"
              className="h-14 w-full text-base"
              onClick={() => navigate('/cadastro')}
            >
              Começar
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Já tenho conta — Entrar
            </Button>
          </>
        ) : (
          <Button
            size="lg"
            className="h-14 w-full text-base"
            onClick={() => setStep((s) => s + 1)}
          >
            Próximo
            <ArrowRight />
          </Button>
        )}
      </div>
    </main>
  )
}
