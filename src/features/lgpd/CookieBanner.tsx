import { useNavigate } from 'react-router-dom'
import { Cookie } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { usePreferenciasPrivacidade } from '@/hooks'

export function CookieBanner() {
  const navigate = useNavigate()
  const {
    dataAtualizacao,
    aceitarTodasPreferencias,
    manterApenasEssenciais,
  } = usePreferenciasPrivacidade()

  if (dataAtualizacao !== null) return null

  return (
    <div
      role="dialog"
      aria-label="Preferências de cookies"
      aria-describedby="cookie-desc"
      className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-lg px-4 pb-4 md:bottom-6"
    >
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-indigo/10 text-brand-indigo">
            <Cookie className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg text-foreground">
              Privacidade em primeiro lugar
            </h2>
            <p id="cookie-desc" className="mt-1 text-sm text-muted-foreground">
              Usamos cookies essenciais para o app funcionar. Opcionalmente, analytics
              e marketing ajudam a melhorar ofertas — você controla tudo em Perfil ›
              Privacidade.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button size="sm" onClick={aceitarTodasPreferencias} className="flex-1">
                Aceitar todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={manterApenasEssenciais}
                className="flex-1"
              >
                Só essenciais
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/conta/privacidade')}
              >
                Configurar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
