#!/usr/bin/env node
/**
 * npx @veroao/invoice <command>
 *   dev [dir] [--port 3200]   live preview of the templates in dir (default: templates/ or modelos/)
 */
import { readFileSync } from 'node:fs'
import { dev } from './dev.js'

const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string }
const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(name)
  if (i === -1) return undefined
  const v = args[i + 1]
  args.splice(i, 2)
  return v
}

const HELP = `
  @veroao/invoice ${pkg.version}

  Uso:
    npx @veroao/invoice dev [pasta] [--port 3200]

  Comandos:
    dev       Pré-visualização ao vivo dos modelos (.tsx) da pasta
              (por omissão: templates/ ou modelos/, senão a pasta actual)

  Opções:
    --port    Porta do servidor (por omissão 3200)
    --help    Esta ajuda
    --version Versão
`

if (args.includes('--version') || args.includes('-v')) {
  console.log(pkg.version)
} else if (args.includes('--help') || args.includes('-h') || !args.length) {
  console.log(HELP)
} else if (args[0] === 'dev') {
  const port = Number(flag('--port') ?? 3200)
  await dev({ dir: args[1], port })
} else {
  console.error(`\n  Comando desconhecido: ${args[0]}\n${HELP}`)
  process.exit(1)
}
