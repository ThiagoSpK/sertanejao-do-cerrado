import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  const { pathname } = useLocation()
  return (
    <main className="grid min-h-screen place-items-center bg-background p-8">
      <div className="max-w-md space-y-4 text-center">
        <p className="font-display text-6xl text-primary">404</p>
        <h1 className="font-display text-2xl text-foreground">
          Rota não encontrada
        </h1>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono">{pathname}</code> não está mapeada.
        </p>
        <Button asChild>
          <Link to="/">Voltar pra home</Link>
        </Button>
      </div>
    </main>
  )
}
