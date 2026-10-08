import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  // Os templates da galeria (../../templates) importam "@veroao/invoice": nos testes, o código-fonte.
  resolve: { alias: { '@veroao/invoice': fileURLToPath(new URL('./src/index.ts', import.meta.url)) } },
  esbuild: { jsx: 'automatic' },
  test: { testTimeout: 60_000 },
})
