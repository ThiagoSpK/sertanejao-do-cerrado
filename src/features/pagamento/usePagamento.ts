import { useCallback, useRef, useState } from 'react'

import {
  processarTransacaoExterna,
  type DadosTransacao,
  type ResultadoTransacao,
} from '@/services/transacaoApi'
import type { MetodoPagamento } from '@/features/pedidos/types'

export type EstadoTransacao =
  | 'idle'
  | 'processando'
  | 'aprovado'
  | 'recusado'
  | 'erro'

const TIMEOUT_MS = 30_000

export interface UseTransacaoReturn {
  estado: EstadoTransacao
  resultado: ResultadoTransacao | null
  processar: (
    metodo: MetodoPagamento,
    dados?: DadosTransacao,
  ) => Promise<ResultadoTransacao>
  pagar: (
    metodo: MetodoPagamento,
    dados?: DadosTransacao,
  ) => Promise<ResultadoTransacao>
  resetar: () => void
}

export function useTransacao(): UseTransacaoReturn {
  const [estado, setEstado] = useState<EstadoTransacao>('idle')
  const [resultado, setResultado] = useState<ResultadoTransacao | null>(null)
  const cancelarTimeoutRef = useRef<number | null>(null)

  const limparTimeout = useCallback(() => {
    if (cancelarTimeoutRef.current !== null) {
      clearTimeout(cancelarTimeoutRef.current)
      cancelarTimeoutRef.current = null
    }
  }, [])

  const processar = useCallback(
    async (metodo: MetodoPagamento, dados?: DadosTransacao) => {
      setEstado('processando')
      setResultado(null)

      const promessaTimeout = new Promise<ResultadoTransacao>((resolve) => {
        cancelarTimeoutRef.current = window.setTimeout(
          () =>
            resolve({
              status: 'erro',
              mensagem:
                'Tempo esgotado aguardando o adquirente. Tente outro método.',
            }),
          TIMEOUT_MS,
        )
      })

      const r = await Promise.race([
        processarTransacaoExterna(metodo, dados),
        promessaTimeout,
      ])
      limparTimeout()

      setResultado(r)
      if (r.status === 'aprovado') setEstado('aprovado')
      else if (r.status === 'recusado') setEstado('recusado')
      else setEstado('erro')

      return r
    },
    [limparTimeout],
  )

  const resetar = useCallback(() => {
    limparTimeout()
    setEstado('idle')
    setResultado(null)
  }, [limparTimeout])

  return { estado, resultado, processar, pagar: processar, resetar }
}

/** @deprecated use useTransacao */
export const usePagamento = useTransacao
