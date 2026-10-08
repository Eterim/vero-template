import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// A pré-visualização do `dev` é compilada para dist/preview e vai dentro do pacote.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), tailwindcss()],
  build: { outDir: '../dist/preview', emptyOutDir: true, chunkSizeWarningLimit: 4000 },
  server: { proxy: { '/api': 'http://localhost:3200' } },
})
