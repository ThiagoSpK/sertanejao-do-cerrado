import { useLojaAtiva } from '@/hooks'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, MapPin, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Unidade } from '@/features/unidades/types'
import { calcularDistanciaKm, listarLojas } from '@/services/lojasApi'
import { cn } from '@/lib/utils'

interface StatusHorario {
  aberto: boolean
  rotulo: string
}

function statusDoDia(unidade: Unidade): StatusHorario {
  const dia = new Date().getDay()
  let raw: string
  if (dia === 0) raw = unidade.horarios.domingo
  else if (dia === 6) raw = unidade.horarios.sabado
  else raw = unidade.horarios.segundaSexta

  if (raw === 'Fechado') return { aberto: false, rotulo: 'Fechado hoje' }
  return { aberto: true, rotulo: `Hoje: ${raw}` }
}

export default function SelecaoUnidade() {
  const navigate = useNavigate()
  const setUnidade = useLojaAtiva().selecionarLoja
  const unidadeAtual = useLojaAtiva().lojaAtiva

  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalGeo, setModalGeo] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  )

  useEffect(() => {
    listarLojas()
      .then(setUnidades)
      .finally(() => setCarregando(false))
  }, [])

  function permitirGeolocalizacao() {
    setModalGeo(false)
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => undefined,
    )
  }

  function selecionar(u: Unidade) {
    setUnidade(u)
    navigate('/home', { replace: true })
  }

  const termo = busca.trim().toLowerCase()
  const visiveis = unidades
    .filter(
      (u) =>
        !termo ||
        u.nome.toLowerCase().includes(termo) ||
        u.endereco.toLowerCase().includes(termo),
    )
    .map((u) => ({
      unidade: u,
      distancia: coords ? calcularDistanciaKm(coords, u) : null,
    }))
    .sort((a, b) => {
      if (a.distancia !== null && b.distancia !== null)
        return a.distancia - b.distancia
      return a.unidade.nome.localeCompare(b.unidade.nome)
    })

  return (
    <main className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background px-3 py-3">
        <Button asChild variant="ghost" size="icon" aria-label="Fechar">
          <Link to="/home">
            <X />
          </Link>
        </Button>
        <h1 className="font-display text-xl text-foreground">
          Escolha sua unidade
        </h1>
        <div className="size-10" aria-hidden />
      </header>

      <div className="mx-auto w-full max-w-md space-y-5 px-5 md:max-w-2xl">
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-foreground">
                Encontrar unidade próxima
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {coords
                  ? 'Localização permitida — unidades ordenadas por distância.'
                  : 'Permita acesso à sua localização para sugestões automáticas.'}
              </p>
            </div>
          </div>
          {!coords && (
            <Button
              variant="outline"
              className="mt-3 w-full border-primary/40 text-primary hover:bg-primary/5"
              onClick={() => setModalGeo(true)}
            >
              Permitir localização
            </Button>
          )}
        </section>

        <div className="relative">
          <Search
            className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground"
            aria-hidden
          />
          <label htmlFor="busca-unidade" className="sr-only">
            Buscar unidade
          </label>
          <input
            id="busca-unidade"
            type="search"
            placeholder="Buscar por bairro ou endereço…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-card pl-10 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <ul className="space-y-3">
          {carregando &&
            Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="h-24 animate-pulse rounded-xl bg-muted"
                aria-hidden
              />
            ))}

          {!carregando &&
            visiveis.map(({ unidade, distancia }) => {
              const { aberto, rotulo } = statusDoDia(unidade)
              const ativa = unidade.id === unidadeAtual?.id
              return (
                <li key={unidade.id}>
                  <button
                    type="button"
                    onClick={() => selecionar(unidade)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors',
                      ativa
                        ? 'border-primary'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-display text-base text-foreground">
                          Sertanejão — {unidade.nome}
                        </h3>
                        {distancia !== null && (
                          <span className="text-xs text-muted-foreground">
                            {distancia.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs text-muted-foreground">
                          {unidade.endereco}
                        </p>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            aberto
                              ? 'bg-feedback-success/15 text-feedback-success'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {aberto ? 'Aberto' : 'Fechado'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rotulo}</p>
                      {!unidade.cozinhaCompleta && (
                        <p className="text-xs italic text-secondary-foreground">
                          Cardápio reduzido
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      className="text-muted-foreground transition-colors group-hover:text-primary"
                      aria-hidden
                    />
                  </button>
                </li>
              )
            })}

          {!carregando && visiveis.length === 0 && (
            <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhuma unidade encontrada para "{busca}".
            </li>
          )}
        </ul>
      </div>

      <Dialog open={modalGeo} onOpenChange={setModalGeo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              Por que precisamos da sua localização?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-left">
                <p>Usamos sua localização apenas para:</p>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  <li>Sugerir a unidade Sertanejão mais próxima</li>
                  <li>Estimar tempo de retirada</li>
                </ul>
                <p className="pt-1 text-xs text-muted-foreground">
                  Não compartilhamos com terceiros. Você pode revogar em Conta ›
                  Privacidade.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setModalGeo(false)}>
              Escolher manualmente
            </Button>
            <Button onClick={permitirGeolocalizacao}>Permitir acesso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
