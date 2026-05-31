import { useGestaoPedidos, useLojaAtiva, useSacola } from '@/hooks'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Info, QrCode } from 'lucide-react'

import { Button } from '@/components/ui/button'
import PagamentoProcessando from '@/pages/cliente/PagamentoProcessando'
import PagamentoFalha from '@/pages/cliente/PagamentoFalha'
import { usePagamento } from '@/features/pagamento/usePagamento'
import {
  ROTULOS_METODO,
  type MetodoPagamento,
  type ModoRetirada,
} from '@/features/pedidos/types'
import type { DadosCartao, DadosTransacao } from '@/services/transacaoApi'
import { formatarPreco } from '@/lib/formatadores'

interface CheckoutState {
  metodo: MetodoPagamento
  modoRetirada: ModoRetirada
  total: number
}

function ehCheckoutState(v: unknown): v is CheckoutState {
  if (!v || typeof v !== 'object') return false
  const s = v as Partial<CheckoutState>
  return (
    typeof s.metodo === 'string' &&
    typeof s.modoRetirada === 'string' &&
    typeof s.total === 'number'
  )
}

export default function Pagamento() {
  const location = useLocation()
  const navigate = useNavigate()
  const { estado, resultado, pagar, resetar } = usePagamento()

  const itens = useSacola().itens
  const cupom = useSacola().cupom
  const limparCarrinho = useSacola().esvaziarSacola
  const { subtotal, desconto, total } = useSacola().totais
  const unidadeAtual = useLojaAtiva().lojaAtiva
  const criarPedido = useGestaoPedidos().registrarPedido

  const checkout = ehCheckoutState(location.state) ? location.state : null

  // Guarda — chegada direta na rota sem passar pelo checkout
  useEffect(() => {
    if (!checkout || itens.length === 0 || !unidadeAtual) {
      navigate('/carrinho', { replace: true })
    }
  }, [checkout, itens.length, unidadeAtual, navigate])

  if (!checkout || !unidadeAtual || itens.length === 0) return null

  // Centraliza o lado pós-pagamento: aprovado → cria pedido + limpa carrinho + navega.
  const jaConfirmadoRef = useRef(false)
  useEffect(() => {
    if (estado !== 'aprovado' || !resultado || resultado.status !== 'aprovado')
      return
    if (jaConfirmadoRef.current) return
    jaConfirmadoRef.current = true

    const pedido = criarPedido({
      unidadeId: unidadeAtual.id,
      unidadeNome: unidadeAtual.nome,
      itens,
      cupom,
      subtotal,
      desconto,
      total,
      metodoPagamento: checkout.metodo,
      modoRetirada: checkout.modoRetirada,
      canal: 'app',
      transacaoId: resultado.transacaoId,
    })
    limparCarrinho()
    navigate(`/pagamento/sucesso?pedido=${pedido.id}`, { replace: true })
  }, [
    estado,
    resultado,
    checkout,
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

  if (estado === 'processando') {
    return <PagamentoProcessando metodo={checkout.metodo} />
  }

  if (estado === 'recusado' || estado === 'erro') {
    if (!resultado) return null
    return (
      <PagamentoFalha
        resultado={resultado}
        onTentarOutra={() => {
          resetar()
          navigate('/checkout')
        }}
      />
    )
  }

  return (
    <ColetaPagamento
      metodo={checkout.metodo}
      total={checkout.total}
      onConfirmar={(dados) => void pagar(checkout.metodo, dados)}
    />
  )
}

interface ColetaProps {
  metodo: MetodoPagamento
  total: number
  onConfirmar: (dados?: DadosTransacao) => void
}

function ColetaPagamento({ metodo, total, onConfirmar }: ColetaProps) {
  if (metodo === 'pix') return <ColetaPix total={total} onConfirmar={onConfirmar} />
  if (metodo === 'vr') return <ColetaVR total={total} onConfirmar={onConfirmar} />
  return <ColetaCartao metodo={metodo} total={total} onConfirmar={onConfirmar} />
}

function CabecalhoVoltar() {
  return (
    <header className="mb-4 flex items-center gap-2">
      <Button asChild variant="ghost" size="icon" aria-label="Voltar">
        <Link to="/checkout">
          <ArrowLeft />
        </Link>
      </Button>
      <h1 className="font-display text-2xl text-foreground">Pagamento</h1>
    </header>
  )
}

function ColetaPix({
  total,
  onConfirmar,
}: {
  total: number
  onConfirmar: (dados?: DadosTransacao) => void
}) {
  // PIX simulado: ao montar, dispara após 1s pra dar tempo do cliente ver o QR.
  useEffect(() => {
    const id = window.setTimeout(() => onConfirmar(), 1000)
    return () => window.clearTimeout(id)
  }, [onConfirmar])

  return (
    <section className="px-4 py-6 md:px-8">
      <CabecalhoVoltar />
      <div className="mx-auto max-w-md space-y-5 text-center">
        <p className="text-sm text-muted-foreground">
          Aponte a câmera do app do seu banco
        </p>
        <div className="mx-auto grid size-56 place-items-center rounded-2xl border border-border bg-card text-muted-foreground shadow-sm">
          <QrCode className="size-32" aria-hidden strokeWidth={1.2} />
        </div>
        <p className="text-xs text-muted-foreground">
          Total: <strong>{formatarPreco(total)}</strong>
        </p>
        <p className="text-xs italic text-muted-foreground">
          (Simulação acadêmica — confirmação automática em segundos)
        </p>
      </div>
    </section>
  )
}

function ColetaCartao({
  metodo,
  total,
  onConfirmar,
}: {
  metodo: MetodoPagamento
  total: number
  onConfirmar: (dados?: DadosTransacao) => void
}) {
  const [numero, setNumero] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')
  const [nome, setNome] = useState('')

  function mascararNumero(v: string) {
    return v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim()
  }

  function mascararValidade(v: string) {
    const n = v.replace(/\D/g, '').slice(0, 4)
    if (n.length <= 2) return n
    return `${n.slice(0, 2)}/${n.slice(2)}`
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const dados: DadosCartao = {
      numero: numero.replace(/\s/g, ''),
      nome,
      validade,
      cvv,
    }
    onConfirmar(dados)
  }

  const podeSubmeter =
    numero.replace(/\s/g, '').length >= 13 && validade.length >= 4 && cvv.length >= 3

  return (
    <section className="px-4 py-6 md:px-8">
      <CabecalhoVoltar />
      <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
        <p className="text-sm text-muted-foreground">
          Dados do {ROTULOS_METODO[metodo]}
        </p>

        <div>
          <label htmlFor="cc-numero" className="mb-1 block text-xs font-bold text-foreground">
            Número do cartão
          </label>
          <input
            id="cc-numero"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            value={numero}
            onChange={(e) => setNumero(mascararNumero(e.target.value))}
            placeholder="0000 0000 0000 0000"
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-base tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cc-val" className="mb-1 block text-xs font-bold text-foreground">
              Validade
            </label>
            <input
              id="cc-val"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              value={validade}
              onChange={(e) => setValidade(mascararValidade(e.target.value))}
              placeholder="MM/AA"
              className="h-11 w-full rounded-xl border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label htmlFor="cc-cvv" className="mb-1 block text-xs font-bold text-foreground">
              CVV
            </label>
            <input
              id="cc-cvv"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="000"
              className="h-11 w-full rounded-xl border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="cc-nome" className="mb-1 block text-xs font-bold text-foreground">
            Nome impresso no cartão
          </label>
          <input
            id="cc-nome"
            type="text"
            autoComplete="cc-name"
            value={nome}
            onChange={(e) => setNome(e.target.value.toUpperCase())}
            placeholder="COMO IMPRESSO NO CARTÃO"
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-base uppercase text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <aside className="flex items-start gap-2 rounded-lg border border-border bg-secondary/15 p-3 text-xs text-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-secondary-foreground" aria-hidden />
          <div className="space-y-1">
            <p className="font-bold">Modo de demonstração</p>
            <p>
              Use <code className="font-mono">4000 0000 0000 0002</code> para
              simular cartão recusado.
            </p>
            <p>
              Use <code className="font-mono">4000 0000 0000 0119</code> para
              simular falha de comunicação.
            </p>
            <p>Qualquer outro número é aprovado em ~90% das tentativas.</p>
          </div>
        </aside>

        <Button
          type="submit"
          size="lg"
          disabled={!podeSubmeter}
          className="h-12 w-full text-sm font-bold uppercase tracking-wide"
        >
          Pagar {formatarPreco(total)}
        </Button>
      </form>
    </section>
  )
}

function ColetaVR({
  total,
  onConfirmar,
}: {
  total: number
  onConfirmar: (dados?: DadosTransacao) => void
}) {
  const [operadora, setOperadora] = useState('sodexo')

  return (
    <section className="px-4 py-6 md:px-8">
      <CabecalhoVoltar />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onConfirmar({ operadora })
        }}
        className="mx-auto max-w-md space-y-4"
      >
        <p className="text-sm text-muted-foreground">
          Selecione a operadora de vale-refeição
        </p>
        <div className="space-y-2">
          {(['sodexo', 'alelo', 'vr', 'ticket'] as const).map((op) => {
            const ativo = operadora === op
            return (
              <label
                key={op}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 shadow-sm transition-colors ${ativo ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}
              >
                <input
                  type="radio"
                  name="operadora-vr"
                  value={op}
                  checked={ativo}
                  onChange={() => setOperadora(op)}
                  className="size-5 accent-primary"
                />
                <span className="text-sm font-medium uppercase text-foreground">
                  {op}
                </span>
              </label>
            )
          })}
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full text-sm font-bold uppercase tracking-wide"
        >
          Pagar {formatarPreco(total)}
        </Button>
      </form>
    </section>
  )
}
