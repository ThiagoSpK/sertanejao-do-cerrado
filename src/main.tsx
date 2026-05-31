import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from '@/App'
import { AppProviders } from '@/contexts/AppProviders'
import { ErrorBoundary } from '@/components/organisms/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import '@/styles/globals.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Elemento #root não encontrado em index.html')

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <App />
          <Toaster richColors position="top-center" />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
