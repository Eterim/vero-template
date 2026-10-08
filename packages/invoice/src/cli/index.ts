#!/usr/bin/env node
/**
 * npx @veroao/invoice <command>
 *   init [dir]                new project with a starter template
 *   dev [dir] [--port 3200]   live preview of the templates in dir (default: templates/)
 *   check [dir]               AGT and safety checks, exit code 1 on problems
 */
import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { check } from './check.js'
import { dev } from './dev.js'
import { init } from './init.js'

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
    npx @veroao/invoice init [pasta]
    npx @veroao/invoice dev [pasta] [--port 3200]
    npx @veroao/invoice check [pasta]

  Comandos:
    init      Cria um projecto novo com um template de partida
              (por omissão na pasta vero-invoice)
    dev       Pré-visualização ao vivo dos templates (.tsx) da pasta
              (por omissão: templates/, senão a pasta actual)
    check     Verifica os templates: compilam, cumprem as regras da AGT e
              não têm dados fiscais ou de pagamento escritos à mão

  Opções:
    --port    Porta do servidor (por omissão 3200)
    --help    Esta ajuda
    --version Versão
`

if (args.includes('--version') || args.includes('-v')) {
  console.log(pkg.version)
} else if (args.includes('--help') || args.includes('-h') || !args.length) {
  console.log(HELP)
} else if (args[0] === 'init') {
  try {
    const root = init({ dir: args[1], version: pkg.version })
    const rel = relative(process.cwd(), root)
    console.log(`\n  Projecto criado em ${rel || '.'}\n\n  Próximos passos:\n${rel ? `    cd ${rel}\n` : ''}    npm install\n    npm run dev\n\n  O template está em templates/invoice.tsx.\n`)
  } catch (e) {
    console.error(`\n  ${(e as Error).message}\n`)
    process.exit(1)
  }
} else if (args[0] === 'check') {
  process.exit((await check(args[1])) ? 1 : 0)
} else if (args[0] === 'dev') {
  const port = Number(flag('--port') ?? 3200)
  await dev({ dir: args[1], port })
} else {
  console.error(`\n  Comando desconhecido: ${args[0]}\n${HELP}`)
  process.exit(1)
}
