import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Delete,
  Lock,
  X,
} from 'lucide-react'

import { CordelDivider } from '@/components/molecules/CordelDivider'
import { mascararCPF, validarCPF } from '@/lib/validators'
import { cn } from '@/lib/utils'

const DIAS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
]
const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatarCpfDigits(d: string): string {
  const a = d.slice(0, 3)
  const b = d.slice(3, 6)
  const c = d.slice(6, 9)
  const e = d.slice(9, 11)
  let out = a
  if (d.length >= 4) out += '.' + b
  if (d.length >= 7) out += '.' + c
  if (d.length >= 10) out += '-' + e
  return out
}

export default function Identificacao() {
  const navigate = useNavigate()
  const [digitos, setDigitos] = useState('')
  const [agora, setAgora] = useState(() => new Date())
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const completo = digitos.length === 11
  const horaTexto = `${pad(agora.getHours())}:${pad(agora.getMinutes())}`
  const dataTexto = `${DIAS[agora.getDay()]}, ${agora.getDate()} de ${MESES[agora.getMonth()]}`

  function press(tecla: string) {
    setErro(null)
    if (tecla === 'del') {
      setDigitos((d) => d.slice(0, -1))
      return
    }
    if (tecla === 'ok') {
      if (completo) confirmar()
      return
    }
    if (digitos.length < 11) setDigitos((d) => d + tecla)
  }

  function confirmar() {
    if (!validarCPF(mascararCPF(digitos))) {
      setErro('CPF inválido. Confira os dígitos.')
      return
    }
    navigate('/totem/cardapio')
  }

  function pular() {
    navigate('/totem/cardapio')
  }

  function cancelar() {
    navigate('/totem', { replace: true })
  }

  return (
    <>
      {/* HEADER 100px */}
      <header className="flex h-[100px] flex-none items-center justify-between border-b border-[rgba(61,40,23,0.12)] bg-white px-12">
        <div className="inline-flex items-center gap-3.5 text-[22px] font-semibold tracking-[0.02em] text-foreground">
          <span
            className="size-2.5 rounded-full bg-[#4A6741] shadow-[0_0_0_4px_rgba(74,103,65,0.15)]"
            aria-hidden
          />
          <span className="font-variant-numeric tabular-nums">{horaTexto}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-[18px] font-medium text-muted-foreground">
            {dataTexto}
          </span>
        </div>
        <button
          type="button"
          onClick={cancelar}
          aria-label="Cancelar e voltar ao início"
          className="inline-flex h-[60px] items-center gap-2.5 rounded-full border-2 border-[#8C716B] px-5 text-[18px] font-bold uppercase tracking-[0.05em] text-foreground transition-colors hover:bg-[#F2EBE0] active:scale-95"
        >
          <X className="size-[22px]" aria-hidden strokeWidth={2.2} />
          Cancelar
        </button>
      </header>

      {/* HERO */}
      <section className="flex flex-none flex-col gap-[18px] px-20 pb-6 pt-14">
        <span
          className="inline-flex items-center gap-3 self-start rounded-full bg-[rgba(74,103,65,0.10)] px-5 py-2.5 text-[16px] font-bold uppercase tracking-[0.08em] text-[#4A6741]"
        >
          <BadgeCheck className="size-[18px]" aria-hidden />
          Programa Fidelidade Sertanejão
        </span>
        <h1
          style={{ fontFamily: '"Playfair Display", serif' }}
          className="text-[64px] font-bold leading-[1.05] tracking-[-0.02em] text-primary"
        >
          Você é cliente Sertanejão?
        </h1>
        <p className="max-w-[880px] text-[32px] leading-[1.35] text-muted-foreground">
          Digite seu CPF para acumular pontos do programa de fidelidade.
        </p>
      </section>

      <CordelDivider className="mx-20 mt-7" />

      {/* CENTER: input + keypad */}
      <section className="flex flex-1 flex-col items-center gap-9 px-20 pb-6 pt-9">
        {/* CPF field */}
        <div
          className={cn(
            'relative flex h-[120px] w-[800px] items-center justify-center gap-2 rounded-[20px] border-2 bg-white shadow-[0_4px_12px_rgba(61,40,23,0.08),inset_0_-3px_0_0_rgba(61,40,23,0.04)] transition-colors',
            digitos.length > 0 ? 'border-primary' : 'border-[#8C716B]',
          )}
        >
          <span className="absolute -top-[14px] left-7 bg-background px-3 text-[14px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            CPF<span className="ml-1 text-primary">*</span>
          </span>
          <span
            className={cn(
              'text-center text-[56px] font-semibold leading-none tracking-[0.02em] tabular-nums',
              digitos.length === 0
                ? 'text-[#c9beae] font-medium'
                : 'text-foreground',
            )}
          >
            {digitos.length === 0
              ? '000.000.000-00'
              : formatarCpfDigits(digitos)}
          </span>
          {digitos.length > 0 && digitos.length < 11 && (
            <span
              aria-hidden
              className="ml-1 inline-block h-14 w-[3px] translate-y-[2px] animate-[blink_1.05s_steps(1)_infinite] bg-primary"
            />
          )}
        </div>

        {erro && (
          <p role="alert" className="-mt-4 text-[24px] font-bold text-destructive">
            {erro}
          </p>
        )}

        {/* Keypad 3×4 */}
        <div className="grid grid-cols-3 gap-5" role="group" aria-label="Teclado numérico">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <Tecla key={n} onClick={() => press(n)}>
              {n}
            </Tecla>
          ))}
          <TeclaAcao onClick={() => press('del')} disabled={digitos.length === 0}>
            <Delete className="size-9" aria-hidden />
            Apagar
          </TeclaAcao>
          <Tecla onClick={() => press('0')}>0</Tecla>
          <TeclaConfirmar onClick={() => press('ok')} disabled={!completo}>
            <Check className="size-10" aria-hidden strokeWidth={2.4} />
            Confirmar
          </TeclaConfirmar>
        </div>
      </section>

      {/* FOOTER 240px */}
      <footer className="relative flex h-[240px] flex-none flex-col items-center justify-center gap-[18px] border-t border-[rgba(61,40,23,0.12)] bg-white px-20 py-6">
        <div
          aria-hidden
          className="absolute -top-[1px] left-20 right-20 border-t border-dashed border-[#E0BFB9]"
        />
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={pular}
            className="inline-flex h-[100px] w-[480px] items-center justify-center rounded-2xl border-[3px] border-primary bg-transparent text-[24px] font-bold uppercase tracking-[0.06em] text-primary transition-colors hover:bg-[rgba(200,75,49,0.06)] active:scale-95"
          >
            Pular esta etapa
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={!completo}
            className="inline-flex h-[100px] w-[480px] items-center justify-center gap-3.5 rounded-2xl bg-primary text-[24px] font-bold uppercase tracking-[0.06em] text-primary-foreground shadow-[0_4px_0_0_#8a3520] transition-colors hover:bg-[#A6331B] disabled:cursor-not-allowed disabled:bg-[#d9cfc2] disabled:shadow-none"
          >
            Continuar
            <ArrowRight className="size-[26px]" aria-hidden strokeWidth={2.4} />
          </button>
        </div>
        <p className="inline-flex items-center gap-2.5 text-center text-[18px] italic text-muted-foreground">
          <Lock className="size-4 opacity-80" aria-hidden />
          Seus dados são protegidos pela LGPD.
        </p>
      </footer>

      <style>{`
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
      `}</style>
    </>
  )
}

interface TeclaProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

function Tecla({ children, onClick, disabled }: TeclaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ fontFamily: '"Playfair Display", serif' }}
      className="grid h-[150px] w-[200px] place-items-center rounded-[18px] border-2 border-primary bg-white text-[64px] font-bold leading-none text-foreground shadow-[0_3px_0_0_rgba(200,75,49,0.18),0_1px_2px_rgba(61,40,23,0.06)] transition-all hover:bg-[rgba(200,75,49,0.06)] active:translate-y-0.5 active:scale-[0.97] active:bg-primary active:text-primary-foreground disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function TeclaAcao({ children, onClick, disabled }: TeclaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[150px] w-[200px] flex-col items-center justify-center gap-1.5 rounded-[18px] border-2 border-primary bg-white text-[22px] font-bold uppercase tracking-[0.05em] text-foreground shadow-[0_3px_0_0_rgba(200,75,49,0.18),0_1px_2px_rgba(61,40,23,0.06)] transition-all hover:bg-[rgba(200,75,49,0.06)] active:translate-y-0.5 active:scale-[0.97] active:bg-primary active:text-primary-foreground disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function TeclaConfirmar({ children, onClick, disabled }: TeclaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[150px] w-[200px] flex-col items-center justify-center gap-1.5 rounded-[18px] border-2 border-primary bg-primary text-[22px] font-bold uppercase tracking-[0.05em] text-primary-foreground shadow-[0_4px_0_0_#8a3520,0_1px_2px_rgba(61,40,23,0.06)] transition-all hover:bg-[#A6331B] active:translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:border-[#d9cfc2] disabled:bg-[#d9cfc2] disabled:text-white disabled:shadow-none"
    >
      {children}
    </button>
  )
}
