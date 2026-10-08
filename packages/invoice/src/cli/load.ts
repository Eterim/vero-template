/**
 * Loads a template file (.tsx/.jsx) and compiles it to the JSON template.
 * esbuild bundles the user's code; react, react/jsx-runtime and @veroao/invoice always
 * resolve to this package's own copies, so it works even in a project with nothing installed.
 */
import { build, type Plugin } from 'esbuild'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createElement, type FC } from 'react'
import { compile, CompileError } from '../compile.js'
import type { TemplateV2 } from '../core/types.js'

const require = createRequire(import.meta.url)
const SELF = new URL('../index.js', import.meta.url)
const SHARED: Record<string, string> = {
  react: require.resolve('react'),
  'react/jsx-runtime': require.resolve('react/jsx-runtime'),
  'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
}

const shared: Plugin = {
  name: 'veroao-shared',
  setup(b) {
    b.onResolve({ filter: /^(react|react\/jsx-runtime|react\/jsx-dev-runtime|@veroao\/invoice)$/ }, (args) => ({
      path: args.path === '@veroao/invoice' ? SELF.href : pathToFileURL(SHARED[args.path]).href,
      external: true,
    }))
  },
}

const outDir = mkdtempSync(join(tmpdir(), 'veroao-invoice-'))
let counter = 0

export interface LoadResult {
  name: string
  file: string
  source: string
  template?: TemplateV2
  /** Problems to show in the preview (syntax, compile, runtime). */
  errors?: { component?: string; message: string }[]
  ms: number
}

export async function loadTemplate(file: string): Promise<LoadResult> {
  const t0 = performance.now()
  const name = basename(file).replace(/\.(tsx|jsx)$/, '')
  const source = readFileSync(file, 'utf8')
  const done = (r: Omit<LoadResult, 'name' | 'file' | 'source' | 'ms'>): LoadResult => ({ name, file, source, ms: Math.round(performance.now() - t0), ...r })
  try {
    const out = await build({
      entryPoints: [file], bundle: true, write: false, format: 'esm', platform: 'node', target: 'node18',
      jsx: 'automatic', logLevel: 'silent', plugins: [shared],
    })
    const outFile = join(outDir, `${name}-${++counter}.mjs`)
    writeFileSync(outFile, out.outputFiles[0].text)
    const mod = (await import(pathToFileURL(outFile).href)) as { default?: FC }
    if (typeof mod.default !== 'function') return done({ errors: [{ message: 'o ficheiro tem de exportar o template por omissão: export default function MeuModelo() { … }' }] })
    return done({ template: compile(createElement(mod.default)) })
  } catch (e) {
    if (e instanceof CompileError) return done({ errors: e.issues })
    const esbuildErrors = (e as { errors?: { text: string; location?: { line: number; column: number } }[] }).errors
    if (esbuildErrors?.length) {
      return done({ errors: esbuildErrors.map((x) => ({ message: x.location ? `${x.text} (linha ${x.location.line}:${x.location.column + 1})` : x.text })) })
    }
    return done({ errors: [{ message: (e as Error).message }] })
  }
}
