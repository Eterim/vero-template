import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// Os templates vivem em /templates na raiz do repositório (fora da app) - o site lê-os de lá.
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig({
  // SITE_BASE=/vero-template/ no GitHub Pages (ver .github/workflows/pages.yml).
  base: process.env.SITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  server: { fs: { allow: [repoRoot] } },
})
