import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Config separada do vite.config porque vite-plugin-pwa é pesado e
// desnecessário pros testes — manter aqui evita carregar service worker
// e manifest em jsdom.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
