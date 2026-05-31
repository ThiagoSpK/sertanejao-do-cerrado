import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, QrCode, Timer } from 'lucide-react'

import { useGestaoPedidos, useSacola } from '@/hooks'
import { pontosPorValorPedido } from '@/features/fidelidade/types'
import { ROTULOS_METODO } from '@/features/pedidos/types'

const REDIRECT_S = 12

export default function Sucesso() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pedidoId = searchParams.get('pedido')
  const { obterPedido } = useGestaoPedidos()
  const { esvaziarSacola } = useSacola()
  const pedido = pedidoId ? obterPedido(pedidoId) : undefined
  const [segundos, setSegundos] = useState(REDIRECT_S)

  useEffect(() => {
    esvaziarSacola()
  }, [esvaziarSacola])

  useEffect(() => {
    if (!pedidoId || !pedido) {
      navigate('/totem', { replace: true })
      return
    }
    const tick = window.setInterval(
      () => setSegundos((s) => Math.max(0, s - 1)),
      1000,
    )
    const redirect = window.setTimeout(
      () => navigate('/totem', { replace: true }),
      REDIRECT_S * 1000,
    )
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(redirect)
    }
  }, [pedidoId, pedido, navigate])

  if (!pedido) return null

  const pts = pontosPorValorPedido(pedido.total)

  return (
    <div className="flex h-full flex-col bg-brand-areia">
      <header className="bg-brand-indigo px-12 py-8 text-center text-white">
        <CheckCircle2 className="mx-auto size-16" aria-hidden />
        <h1 className="mt-4 font-display text-4xl font-bold">Pedido confirmado</h1>
        <p className="mt-2 text-lg text-white/80">Pagamento aprovado — produção iniciada</p>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-12 py-10">
        <div className="w-full max-w-md rounded-3xl border-4 border-brand-indigo bg-white p-10 text-center shadow-xl">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            Senha de retirada
          </p>
          <p className="mt-2 font-display text-8xl font-bold tabular-nums text-brand-indigo">
            {pedido.numero}
          </p>
          <p className="mt-4 text-lg text-foreground">Apresente no balcão</p>
        </div>

        <div className="grid w-full max-w-md gap-3 rounded-2xl bg-white p-6 shadow-md">
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Total pago</span>
            <span className="font-bold">
              R$ {pedido.total.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-muted-foreground">Forma</span>
            <span>{ROTULOS_METODO[pedido.metodoPagamento]}</span>
          </div>
          {pedido.cpfCliente && (
            <div className="flex justify-between text-lg text-brand-verde">
              <span>Pontos Clube Pequi</span>
              <span className="font-bold">+{pts} pts</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-brand-noite/5 px-6 py-4">
          <QrCode className="size-10 text-brand-indigo" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Escaneie o QR no cupom impresso para acompanhar pelo app.
          </p>
        </div>
      </div>

      <footer className="border-t border-border bg-white px-12 py-6 text-center">
        <p className="flex items-center justify-center gap-2 text-muted-foreground" aria-live="polite">
          <Timer className="size-4" aria-hidden />
          Nova sessão em {segundos}s
        </p>
        <button
          type="button"
          onClick={() => navigate('/totem', { replace: true })}
          className="mt-4 w-full max-w-md rounded-xl bg-brand-coral py-4 text-lg font-bold text-white"
        >
          Novo pedido
        </button>
      </footer>
    </div>
  )
}
