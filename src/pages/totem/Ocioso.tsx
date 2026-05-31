import { useNavigate } from 'react-router-dom'
import { ChevronRight, QrCode } from 'lucide-react'

import { useSacola } from '@/hooks'

export default function Ocioso() {
  const navigate = useNavigate()
  const { esvaziarSacola } = useSacola()

  function iniciar() {
    esvaziarSacola()
    navigate('/totem/identificacao')
  }

  return (
    <div className="grid h-full grid-rows-[1fr_auto] bg-brand-noite text-white">
      <div className="flex flex-col items-center justify-center px-16 text-center">
        <div className="mb-10 grid size-32 place-items-center rounded-3xl bg-brand-indigo shadow-2xl">
          <span className="font-display text-6xl font-bold text-brand-areia">R</span>
        </div>
        <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl">
          Autoatendimento Sertanejão
        </h1>
        <p className="mt-4 max-w-lg text-xl text-white/70">
          Monte seu pedido aqui, pague na tela e retire no balcão com o QR code.
        </p>
      </div>

      <button
        type="button"
        onClick={iniciar}
        className="mx-12 mb-16 flex items-center justify-between rounded-2xl bg-brand-coral px-10 py-8 text-left shadow-lg transition hover:bg-brand-coral/90"
      >
        <div>
          <p className="text-3xl font-bold">Começar pedido</p>
          <p className="mt-1 text-lg text-white/85">Toque em qualquer lugar deste botão</p>
        </div>
        <ChevronRight className="size-12 shrink-0" aria-hidden />
      </button>

      <p className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 text-sm text-white/40">
        <QrCode className="size-4" aria-hidden />
        Acumule pontos informando CPF no próximo passo
      </p>
    </div>
  )
}
