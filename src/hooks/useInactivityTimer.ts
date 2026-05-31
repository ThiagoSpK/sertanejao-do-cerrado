import { useEffect, useRef } from 'react'

const EVENTOS = ['mousemove', 'touchstart', 'keydown', 'click'] as const

/**
 * Dispara `onTimeout` após `timeoutMs` sem interação. Reseta a contagem em
 * mousemove/touchstart/keydown/click. Use `enabled=false` na própria tela
 * ociosa pra evitar loop.
 */
export function useInactivityTimer(
  timeoutMs: number,
  onTimeout: () => void,
  enabled = true,
): void {
  const callbackRef = useRef(onTimeout)
  useEffect(() => {
    callbackRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    if (!enabled) return

    let timer = window.setTimeout(() => callbackRef.current(), timeoutMs)

    function reset() {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => callbackRef.current(), timeoutMs)
    }

    EVENTOS.forEach((ev) =>
      window.addEventListener(ev, reset, { passive: true }),
    )
    return () => {
      window.clearTimeout(timer)
      EVENTOS.forEach((ev) => window.removeEventListener(ev, reset))
    }
  }, [timeoutMs, enabled])
}
