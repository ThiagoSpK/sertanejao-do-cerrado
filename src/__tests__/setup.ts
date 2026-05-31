import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// localStorage zerado entre testes pra garantir isolamento — sem isso,
// estado persistido por um teste vaza pro próximo via persistencia.ts.
beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// jsdom não implementa createObjectURL/revokeObjectURL nativamente.
// privacidadeApi.exportarPacoteTitular depende disso pra disparar download.
if (typeof URL.createObjectURL === 'undefined') {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: () => 'blob:test-stub',
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: () => undefined,
  })
}

// jsdom não implementa navegação real, e privacidadeApi cria um <a download>
// e dispara click(). Sem isso, o jsdom solta "Not implemented: navigation"
// no stderr sem quebrar o teste — só polui o output.
HTMLAnchorElement.prototype.click = function () {
  // no-op: o que importa pros testes é que href/download foram setados,
  // não que a navegação aconteça de verdade.
}
