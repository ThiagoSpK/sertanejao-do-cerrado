import { useId, useState, type ComponentProps, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@/lib/utils'

interface Props extends Omit<ComponentProps<'input'>, 'prefix'> {
  label: string
  hint?: string
  erro?: string
  icone?: ReactNode
}

export function FormField({
  label,
  hint,
  erro,
  icone,
  type = 'text',
  className,
  id,
  ...rest
}: Props) {
  const [revelar, setRevelar] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId
  const erroId = erro ? `${inputId}-err` : undefined

  const senha = type === 'password'
  const tipoFinal = senha && revelar ? 'text' : type

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-xs font-semibold uppercase tracking-wide text-foreground/80"
      >
        {label}
      </label>
      <div className="relative">
        {icone && (
          <span
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground"
            aria-hidden
          >
            {icone}
          </span>
        )}
        <input
          id={inputId}
          type={tipoFinal}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erroId}
          className={cn(
            'h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground transition-shadow placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
            icone && 'pl-10',
            senha && 'pr-10',
            erro && 'border-destructive focus:ring-destructive',
            className,
          )}
          {...rest}
        />
        {senha && (
          <button
            type="button"
            aria-label={revelar ? 'Esconder senha' : 'Mostrar senha'}
            onClick={() => setRevelar((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            {revelar ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {erro ? (
        <p id={erroId} role="alert" className="text-xs text-destructive">
          {erro}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
