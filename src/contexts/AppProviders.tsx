import type { ReactNode } from 'react'

import { EquipeProvider } from '@/contexts/EquipeContext'
import { LojaProvider } from '@/contexts/LojaContext'
import {
  ProgramaBridge,
  ProgramaProvider,
} from '@/contexts/ProgramaContext'
import { PedidosProvider } from '@/contexts/PedidosContext'
import { PrivacidadeProvider } from '@/contexts/PrivacidadeContext'
import { SacolaProvider } from '@/contexts/SacolaContext'
import { SessaoProvider } from '@/contexts/SessaoContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PrivacidadeProvider>
      <SessaoProvider>
        <LojaProvider>
          <SacolaProvider>
            <ProgramaProvider>
              <ProgramaBridge />
              <PedidosProvider>
                <EquipeProvider>{children}</EquipeProvider>
              </PedidosProvider>
            </ProgramaProvider>
          </SacolaProvider>
        </LojaProvider>
      </SessaoProvider>
    </PrivacidadeProvider>
  )
}
