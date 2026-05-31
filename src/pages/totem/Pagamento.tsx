import { useGestaoPedidos, useLojaAtiva, useSacola } from '@/hooks'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'


const SIMULACAO_MS = 4000

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatarReal(valor: number): { cur: string; valor: string } {
  return { cur: 'R$', valor: valor.toFixed(2).replace('.', ',') }
}

export default function Pagamento() {
  const navigate = useNavigate()
  const itens = useSacola().itens
  const cupom = useSacola().cupom
  const limparCarrinho = useSacola().esvaziarSacola
  const { qtdItens, subtotal, desconto, total } = useSacola().totais
  const unidadeAtual = useLojaAtiva().lojaAtiva
  const criarPedido = useGestaoPedidos().registrarPedido

  const [agora, setAgora] = useState(() => new Date())
  const jaCriouRef = useRef(false)

  useEffect(() => {
    // Após criar o pedido, limparCarrinho zera `itens` e re-dispara este effect.
    // Sem essa guarda, a próxima execução cai no "carrinho vazio" e redireciona
    // de volta pro carrinho, perdendo a navegação pra /sucesso.
    if (jaCriouRef.current) return

    if (!unidadeAtual || itens.length === 0) {
      navigate('/totem/carrinho', { replace: true })
      return
    }

    const id = window.setTimeout(() => {
      if (jaCriouRef.current) return
      jaCriouRef.current = true
      // Totem confia no callback do hardware da maquininha — aqui simulamos.
      const pedido = criarPedido({
        unidadeId: unidadeAtual.id,
        unidadeNome: unidadeAtual.nome,
        itens,
        cupom,
        subtotal,
        desconto,
        total,
        metodoPagamento: 'credito',
        modoRetirada: 'balcao',
        canal: 'totem',
        transacaoId: `tot_${Date.now()}`,
      })
      limparCarrinho()
      navigate(`/totem/sucesso?pedido=${pedido.id}`, { replace: true })
    }, SIMULACAO_MS)

    return () => window.clearTimeout(id)
  }, [
    unidadeAtual,
    itens,
    cupom,
    subtotal,
    desconto,
    total,
    criarPedido,
    limparCarrinho,
    navigate,
  ])

  useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const horaTexto = `${pad(agora.getHours())}:${pad(agora.getMinutes())}`
  const totalFmt = formatarReal(total)

  return (
    <>
      {/* HEADER 120px */}
      <header className="flex h-[120px] flex-none items-center justify-between border-b border-[rgba(61,40,23,0.12)] bg-white px-10">
        <div className="flex items-center gap-4">
          <div
            className="grid size-14 place-items-center rounded-xl bg-[#F2EBE0] text-primary"
            aria-hidden
          >
            <span style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl font-bold">
              R
            </span>
          </div>
          <div>
            <div
              style={{ fontFamily: '"Playfair Display", serif' }}
              className="whitespace-nowrap text-[28px] font-bold leading-none text-foreground"
            >
              Sertanejão do Cerrado
            </div>
            <div className="mt-1 whitespace-nowrap text-[16px] tracking-[0.02em] text-muted-foreground">
              {unidadeAtual?.nome ?? '—'} · Goiânia
            </div>
          </div>
        </div>
        <div className="inline-flex items-center text-[28px] font-semibold tracking-[0.04em] tabular-nums text-foreground">
          <span
            className="mr-3 inline-block size-2 animate-[live_1.6s_ease-in-out_infinite] rounded-full bg-[#4A6741]"
            aria-hidden
          />
          {horaTexto}
        </div>
        <button
          type="button"
          onClick={() => navigate('/totem/carrinho')}
          className="inline-flex h-[60px] items-center gap-2.5 rounded-full border-2 border-[#8C716B] px-6 text-[18px] font-semibold tracking-[0.04em] text-foreground hover:bg-[#F2EBE0]"
        >
          <X className="size-[18px]" aria-hidden strokeWidth={2.5} />
          Cancelar
        </button>
      </header>

      {/* SUMMARY 300px */}
      <section className="flex h-[300px] flex-none flex-col items-center gap-4 px-10 pb-5 pt-[60px]">
        <div className="flex items-center gap-4 text-[18px] font-bold uppercase tracking-[0.18em] text-primary">
          <span className="size-3 rounded-full bg-primary" aria-hidden />
          <span className="size-3 rounded-full bg-primary" aria-hidden />
          <span className="size-3 rounded-full bg-primary" aria-hidden />
          <span className="size-3 rounded-full bg-primary" aria-hidden />
          <span>Etapa 4 de 4 · Pagamento</span>
        </div>
        <div className="relative flex h-[180px] w-[1000px] items-center justify-between rounded-2xl border border-[rgba(61,40,23,0.12)] bg-[#F2EBE0] px-14">
          <span
            aria-hidden
            className="absolute -left-3.5 top-1/2 size-7 -translate-y-1/2 rounded-full border border-[rgba(61,40,23,0.12)] bg-background"
          />
          <span
            aria-hidden
            className="absolute -right-3.5 top-1/2 size-7 -translate-y-1/2 rounded-full border border-[rgba(61,40,23,0.12)] bg-background"
          />
          <div className="flex flex-col gap-1.5">
            <div className="text-[18px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Seu pedido
            </div>
            <div
              style={{ fontFamily: '"Playfair Display", serif' }}
              className="text-[44px] font-bold leading-none text-foreground"
            >
              {qtdItens} {qtdItens === 1 ? 'item' : 'itens'}
              <small className="ml-3 text-[22px] font-medium tracking-[0.02em] text-muted-foreground">
                · retirada no balcão
              </small>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 text-right">
            <div className="text-[18px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total
            </div>
            <div
              style={{ fontFamily: '"Playfair Display", serif' }}
              className="text-[64px] font-bold leading-none tracking-[-0.01em] text-primary"
            >
              <span className="relative top-2 mr-1.5 align-top text-[32px] font-semibold text-[#A6331B]">
                R$
              </span>
              {total.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
      </section>

      {/* HERO 700px — instrução */}
      <section className="relative flex h-[700px] flex-none flex-col items-center gap-6 px-10">
        <div className="relative flex h-[380px] w-full items-center justify-center">
          <div
            aria-hidden
            className="absolute z-0 size-[720px] max-w-full bg-[radial-gradient(closest-side,rgba(225,161,64,0.22),transparent_70%)]"
            style={{ height: 360 }}
          />
          {/* Cartão flutuante + maquininha — SVG simplificado */}
          <svg
            width={640}
            height={380}
            viewBox="0 0 640 380"
            className="relative z-10"
            aria-hidden
          >
            <defs>
              <linearGradient id="cardGrad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#E1A140" />
                <stop offset="100%" stopColor="#C8893A" />
              </linearGradient>
              <linearGradient id="cardGrad2" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#FAE0B5" />
                <stop offset="100%" stopColor="#E1A140" />
              </linearGradient>
              <linearGradient id="termGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3D2817" />
                <stop offset="100%" stopColor="#2A1B0E" />
              </linearGradient>
              <linearGradient id="screenGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FAF6F1" />
                <stop offset="100%" stopColor="#F2EBE0" />
              </linearGradient>
            </defs>

            {/* Setas pulsantes */}
            <g transform="translate(320 160)">
              <g className="arrow-1">
                <path
                  d="M -22 -10 L 0 12 L 22 -10"
                  fill="none"
                  stroke="#C84B31"
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <g className="arrow-2" transform="translate(0 18)">
                <path
                  d="M -22 -10 L 0 12 L 22 -10"
                  fill="none"
                  stroke="#C84B31"
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.75}
                />
              </g>
              <g className="arrow-3" transform="translate(0 36)">
                <path
                  d="M -22 -10 L 0 12 L 22 -10"
                  fill="none"
                  stroke="#C84B31"
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.5}
                />
              </g>
            </g>

            {/* Cartão flutuante */}
            <g className="floating-card" transform="translate(170 0)">
              <ellipse cx={150} cy={148} rx={120} ry={14} fill="rgba(61,40,23,0.18)" />
              <rect x={20} y={10} width={260} height={150} rx={16} fill="url(#cardGrad)" />
              <rect
                x={20}
                y={10}
                width={260}
                height={60}
                rx={16}
                fill="url(#cardGrad2)"
                opacity={0.45}
              />
              <rect x={42} y={60} width={44} height={34} rx={6} fill="#3D2817" />
              <g transform="translate(108 77)" fill="none" stroke="#3D2817" strokeWidth={3} strokeLinecap="round">
                <path className="wave-1" d="M 0 -14 a 14 14 0 0 1 0 28" />
                <path className="wave-2" d="M 8 -20 a 22 22 0 0 1 0 40" />
                <path className="wave-3" d="M 16 -26 a 30 30 0 0 1 0 52" />
              </g>
              <rect x={42} y={118} width={48} height={6} rx={2} fill="#3D2817" opacity={0.55} />
              <rect x={98} y={118} width={48} height={6} rx={2} fill="#3D2817" opacity={0.55} />
              <rect x={154} y={118} width={48} height={6} rx={2} fill="#3D2817" opacity={0.55} />
              <rect x={210} y={118} width={48} height={6} rx={2} fill="#3D2817" opacity={0.55} />
              <rect x={42} y={134} width={80} height={6} rx={2} fill="#3D2817" opacity={0.4} />
            </g>

            {/* Maquininha */}
            <g transform="translate(140 200)">
              <ellipse className="terminal-glow" cx={180} cy={170} rx={180} ry={14} fill="rgba(200,75,49,0.35)" />
              <rect x={40} y={0} width={280} height={170} rx={22} fill="url(#termGrad)" />
              <rect x={160} y={-6} width={40} height={10} rx={3} fill="#2A1B0E" />
              <rect x={60} y={14} width={240} height={92} rx={10} fill="url(#screenGrad)" />
              <text
                x={180}
                y={44}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize={12}
                fontWeight={700}
                fill="#9B9387"
                letterSpacing={2}
              >
                VALOR A PAGAR
              </text>
              <text
                x={180}
                y={80}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize={32}
                fontWeight={800}
                fill="#3D2817"
              >
                {totalFmt.cur} {totalFmt.valor}
              </text>
              <rect x={100} y={-2} width={160} height={8} rx={3} fill="#1a1108" />
              <rect x={106} y={0} width={148} height={3} rx={1.5} fill="#E1A140" opacity={0.7} />
            </g>
          </svg>
        </div>

        <h1
          className="m-0 max-w-[940px] text-balance text-center text-[56px] font-bold leading-[1.1] tracking-[-0.005em] text-primary"
        >
          Insira ou aproxime seu cartão na maquininha
        </h1>

        <div className="mt-1 flex items-center gap-[18px]">
          <div
            aria-hidden
            className="size-11 animate-spin rounded-full border-[5px] border-[rgba(200,75,49,0.18)] border-t-primary"
          />
          <span className="text-[32px] font-medium text-muted-foreground">
            Aguardando inserção do cartão
            <span className="dots" aria-hidden />
          </span>
        </div>
      </section>

      {/* INFO 300px */}
      <section className="flex h-[300px] flex-none flex-col items-center gap-5 px-10 pt-6">
        <div className="flex w-[1000px] flex-col gap-5 rounded-2xl border border-[rgba(61,40,23,0.12)] bg-white px-10 py-7">
          <div className="flex items-center gap-3 text-[22px] font-bold tracking-[0.02em] text-foreground">
            <span className="size-2.5 rounded-full bg-[#4A6741]" aria-hidden />
            Aceitamos:&nbsp;
            <span className="font-bold">
              Crédito · Débito · Vale-Refeição · PIX
            </span>
          </div>
          <div
            className="grid grid-cols-7 gap-4"
            aria-label="Bandeiras aceitas"
          >
            {(['VISA', 'MC', 'ELO', 'Sodexo', 'Alelo', 'VR', 'PIX'] as const).map(
              (b) => (
                <div
                  key={b}
                  className="grid h-16 place-items-center rounded-md border border-[rgba(61,40,23,0.12)] bg-[#F2EBE0] text-[18px] font-extrabold tracking-[0.02em] text-foreground"
                >
                  {b}
                </div>
              ),
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/totem/carrinho')}
          className="mt-1 cursor-pointer border-none bg-none px-4 py-2 text-[24px] font-medium tracking-[0.01em] text-muted-foreground underline underline-offset-4 hover:text-destructive"
        >
          Cancelar pagamento
        </button>
      </section>

      {/* TOTAL STRIP 140px */}
      <footer className="relative flex h-[140px] flex-none items-center justify-between overflow-hidden bg-primary px-16 text-primary-foreground">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-3"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 12' preserveAspectRatio='none'><path d='M0,6 L5,0 L10,6 L15,0 L20,6 L25,0 L30,6 L35,0 L40,6 L45,0 L50,6 L55,0 L60,6 L65,0 L70,6 L75,0 L80,6 L85,0 L90,6 L95,0 L100,6' fill='none' stroke='rgba(255,255,255,.35)' stroke-width='1.5' stroke-linejoin='miter'/></svg>")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '160px 12px',
          }}
        />
        <span className="text-[28px] font-bold uppercase tracking-[0.18em] opacity-90">
          Valor a pagar
        </span>
        <span className="text-[60px] font-bold leading-none tracking-[-0.005em] tabular-nums">
          <span className="relative top-2 mr-2.5 align-top text-[36px] font-semibold opacity-85">
            R$
          </span>
          {total.toFixed(2).replace('.', ',')}
        </span>
      </footer>

      <style>{`
        @keyframes live { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
        @keyframes hover-card {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-18px); }
        }
        @keyframes pulse-arrow {
          0%   { opacity: 0; transform: translateY(-30px) scale(.95); }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(20px) scale(1.05); }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: .55; }
          50%      { transform: scale(1.08); opacity: .9; }
        }
        @keyframes wave {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes dots {
          0%   { content: ""; }
          25%  { content: "."; }
          50%  { content: ".."; }
          75%  { content: "..."; }
          100% { content: ""; }
        }
        .floating-card { animation: hover-card 2.4s ease-in-out infinite; transform-origin: center; }
        .arrow-1 { animation: pulse-arrow 1.8s ease-out infinite; }
        .arrow-2 { animation: pulse-arrow 1.8s ease-out infinite; animation-delay: .6s; }
        .arrow-3 { animation: pulse-arrow 1.8s ease-out infinite; animation-delay: 1.2s; }
        .terminal-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .wave-1 { animation: wave 2s ease-out infinite; }
        .wave-2 { animation: wave 2s ease-out infinite; animation-delay: .35s; }
        .wave-3 { animation: wave 2s ease-out infinite; animation-delay: .7s; }
        .dots::after {
          content: "";
          display: inline-block;
          width: 1.6ch;
          text-align: left;
          animation: dots 1.6s steps(4, end) infinite;
        }
      `}</style>
    </>
  )
}
