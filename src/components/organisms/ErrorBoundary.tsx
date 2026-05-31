import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  erro: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null }

  static getDerivedStateFromError(erro: Error): State {
    return { erro }
  }

  componentDidCatch(erro: Error, info: ErrorInfo): void {
    // Em produção real isso iria pra um serviço (Sentry, Bugsnag).
    // Aqui mantemos no console pra inspeção via DevTools.
    console.error('Erro não tratado:', erro, info.componentStack)
  }

  recarregar = () => {
    this.setState({ erro: null })
    window.location.reload()
  }

  voltarParaInicio = () => {
    this.setState({ erro: null })
    window.location.replace('/')
  }

  render() {
    if (!this.state.erro) return this.props.children

    return (
      <main className="grid min-h-screen place-items-center bg-background px-6 py-12">
        <div className="max-w-md space-y-6 text-center">
          <div
            className="mx-auto grid size-20 place-items-center rounded-full bg-destructive/10 text-destructive"
            aria-hidden
          >
            <AlertTriangle className="size-10" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl text-foreground">
              Algo deu errado
            </h1>
            <p className="text-sm text-muted-foreground">
              Tivemos um problema inesperado pra mostrar essa tela. Já avisamos
              a equipe — você pode tentar recarregar ou voltar pro início.
            </p>
          </div>

          {import.meta.env.DEV && (
            <pre className="overflow-x-auto rounded-md border border-border bg-muted px-3 py-2 text-left text-xs text-muted-foreground">
              {this.state.erro.message}
            </pre>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={this.recarregar} className="gap-2">
              <RefreshCw className="size-4" aria-hidden />
              Recarregar
            </Button>
            <Button variant="outline" onClick={this.voltarParaInicio}>
              Voltar ao início
            </Button>
          </div>
        </div>
      </main>
    )
  }
}
