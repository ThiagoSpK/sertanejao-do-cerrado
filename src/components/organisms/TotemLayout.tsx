import { useSacola, useLojaAtiva } from '@/hooks'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { TotemScaler } from '@/components/molecules/TotemScaler'
import { SkipLink } from '@/components/atoms/SkipLink'
import { useInactivityTimer } from '@/hooks/useInactivityTimer'
import unidadesMock from '@/mocks/unidades.json'
import type { Unidade } from '@/features/unidades/types'

const TIMEOUT_INATIVIDADE_MS = 30_000
const UNIDADE_PADRAO_TOTEM = 'U01'

export default function TotemLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const limparCarrinho = useSacola().esvaziarSacola
  const { lojaAtiva, selecionarLoja } = useLojaAtiva()

  const naTelaOciosa = location.pathname === '/totem'

  // O totem é hardware fixo numa loja na vida real (configurado uma vez na
  // instalação). No protótipo, se nenhuma unidade está selecionada, lê do mock
  // direto e seta U01 — síncrono, sem esperar `listarLojas` async, pra evitar
  // que a rota filha (ex: /totem/cardapio) renderize antes da unidade chegar.
  useEffect(() => {
    if (lojaAtiva) return
    const unidades = unidadesMock as Unidade[]
    const padrao =
      unidades.find((u) => u.id === UNIDADE_PADRAO_TOTEM) ?? unidades[0]
    if (padrao) selecionarLoja(padrao)
  }, [lojaAtiva, selecionarLoja])

  function resetarParaOcioso() {
    limparCarrinho()
    navigate('/totem', { replace: true })
  }

  // Inatividade só fora da tela ociosa — lá esperar é o estado natural.
  useInactivityTimer(TIMEOUT_INATIVIDADE_MS, resetarParaOcioso, !naTelaOciosa)

  // Bloqueia render do filho até a unidade estar setada. O useEffect acima
  // dispara o set síncrono no mount, mas como effects rodam DEPOIS do render
  // dos filhos, sem essa guarda o /totem/cardapio renderiza uma vez com
  // unidadeAtual=null e cai no fallback "Totem sem unidade configurada".
  if (!lojaAtiva) {
    return (
      <TotemScaler>
        <div className="grid h-full place-items-center px-12 text-center">
          <p className="text-[28px] text-muted-foreground">Iniciando totem…</p>
        </div>
      </TotemScaler>
    )
  }

  return (
    <>
      <SkipLink />
      <TotemScaler>
        <main id="main-content" className="contents">
          <Outlet />
        </main>
      </TotemScaler>
    </>
  )
}
