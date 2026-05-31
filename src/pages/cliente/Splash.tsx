import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = window.setTimeout(
      () => navigate('/onboarding', { replace: true }),
      2000,
    )
    return () => window.clearTimeout(t)
  }, [navigate])

  return (
    <main
      className="grid min-h-screen place-items-center bg-primary text-primary-foreground"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6 px-8 pb-16 text-center">
        <div
          className="grid size-32 place-items-center rounded-full bg-primary-foreground/10 backdrop-blur"
          aria-hidden
        >
          <div className="size-16 rounded-full bg-primary-foreground/95" />
        </div>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">
          Sertanejão do Cerrado
        </h1>
        <p className="text-base opacity-90">Tradição que cabe no seu dia</p>
        <span className="sr-only">Carregando aplicativo…</span>
      </div>
    </main>
  )
}
