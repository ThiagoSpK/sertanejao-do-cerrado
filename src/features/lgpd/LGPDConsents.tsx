import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export interface ValoresConsentimento {
  termos: boolean
  marketing: boolean
  analisePerfil: boolean
}

type CampoConsentimento = keyof ValoresConsentimento

interface Props {
  valores: ValoresConsentimento
  onChange: (campo: CampoConsentimento, valor: boolean) => void
}

export function LGPDConsents({ valores, onChange }: Props) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-border bg-card p-5">
      <legend className="-ml-1 inline-flex items-center gap-2 px-1 text-sm font-semibold text-foreground">
        <ShieldCheck className="size-4 text-primary" />
        Privacidade e consentimento
      </legend>

      <ConsentItem
        checked={valores.termos}
        onChange={(v) => onChange('termos', v)}
        obrigatorio
      >
        Aceito os{' '}
        <Link
          to="/conta/privacidade"
          className="font-medium text-primary hover:underline"
        >
          Termos de Uso
        </Link>{' '}
        e a{' '}
        <Link
          to="/conta/privacidade"
          className="font-medium text-primary hover:underline"
        >
          Política de Privacidade
        </Link>
      </ConsentItem>

      <ConsentItem
        checked={valores.marketing}
        onChange={(v) => onChange('marketing', v)}
      >
        Quero receber comunicações sobre promoções e novidades
      </ConsentItem>

      <ConsentItem
        checked={valores.analisePerfil}
        onChange={(v) => onChange('analisePerfil', v)}
      >
        Autorizo análise do meu perfil de consumo para recomendações personalizadas
      </ConsentItem>

      <p className="border-t border-border/60 pt-3 text-xs italic text-muted-foreground">
        Você poderá alterar essas escolhas em Conta › Privacidade.
      </p>
    </fieldset>
  )
}

interface ItemProps {
  checked: boolean
  onChange: (v: boolean) => void
  obrigatorio?: boolean
  children: ReactNode
}

function ConsentItem({ checked, onChange, obrigatorio, children }: ItemProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-foreground/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={obrigatorio}
        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-input accent-primary"
      />
      <span>
        {children}
        {obrigatorio && (
          <span className="ml-1 text-[11px] uppercase tracking-wider text-destructive">
            obrigatório
          </span>
        )}
      </span>
    </label>
  )
}
