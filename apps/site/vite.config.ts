import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// Os modelos vivem em /templates na raiz do repositório (fora da app) - o site lê-os de lá.
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { fs: { allow: [repoRoot] } },
})
