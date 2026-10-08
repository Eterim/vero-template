/**
 * Verifica as pastas templates/<nome>/ - é o que a CI corre em cada pull request.
 *
 *   npm run check:templates -w packages/invoice            (todos)
 *   npm run check:templates -w packages/invoice -- azul    (só um)
 *
 * Por pasta: ficheiros permitidos e tamanhos, meta.json, o template.tsx lido sem executar
 * (imports e globais proibidos), depois compilado - o template.json tem de ser igual ao
 * gerado, passar a verificação de segurança e desenhar cada tipo sem avisos -, e as
 * pré-visualizações.
 *
 * PR_AUTHOR / PR_ASSOCIATION (vindos da CI): quem não é da equipa só publica na colecção
 * "comunidade" e com o próprio nome de utilizador do GitHub como autor.
 */
import { appendFileSync, existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import { createElement, type FC } from 'react'
import sharp from 'sharp'
import { checkTemplate, compile, render, sampleDocument } from '../src/index.js'
import { auditSource } from './audit-source.js'
import { importJson, type Meta } from './import-json.js'

const ROOT = new URL('../../../templates/', import.meta.url).pathname
const DOC_TYPES = ['FT', 'FR', 'NC', 'ND', 'RC'] as const
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const GITHUB_LOGIN = /^[a-z0-9](?:[a-z0-9-]{0,38})$/i
const RESERVED_AUTHORS = new Set(['vero', 'veroao', 'eterim', 'agt', 'admin', 'oficial', 'official'])
const MAX_BYTES: Record<string, number> = { 'meta.json': 4_000, 'template.tsx': 50_000, 'template.json': 200_000, webp: 300_000 }
const INVISIBLE = /[\u0000-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/

const prAuthor = process.env.PR_AUTHOR?.trim()
const maintainer = !prAuthor || ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(process.env.PR_ASSOCIATION ?? '')

const all = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
const only = process.argv.slice(2).filter(Boolean)
const slugs = only.length ? only : all

const failures = new Map<string, string[]>()

for (const slug of slugs) {
  const problems: string[] = []
  const fail = (m: string) => problems.push(m)
  try {
    await checkFolder(slug, fail)
  } catch (e) {
    fail(`erro inesperado: ${(e as Error).message}`)
  }
  if (problems.length) failures.set(slug, problems)
  console.log(problems.length ? `✗ ${slug}\n${problems.map((p) => `    - ${p}`).join('\n')}` : `✓ ${slug}`)
}

report()
process.exit(failures.size ? 1 : 0)

async function checkFolder(slug: string, fail: (m: string) => void) {
  const dir = join(ROOT, slug)
  if (!existsSync(dir)) return // pasta apagada no PR - nada a verificar aqui
  if (!SLUG.test(slug) || slug.length > 40) fail('nome da pasta: só minúsculas, números e hífenes (máx. 40)')

  // 1. Ficheiros
  const meta = readMeta(dir, fail)
  if (!meta) return
  const expected = new Set(['meta.json', 'template.tsx', 'template.json', ...meta.docTypes.map((t) => `preview-${t.toLowerCase()}.webp`)])
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const st = lstatSync(join(dir, e.name))
    if (st.isSymbolicLink()) { fail(`${e.name}: ligações simbólicas não são permitidas`); continue }
    if (!e.isFile()) { fail(`${e.name}: subpastas não são permitidas`); continue }
    if (!expected.has(e.name)) { fail(`${e.name}: ficheiro não esperado - só ${[...expected].join(', ')}`); continue }
    const max = MAX_BYTES[e.name.endsWith('.webp') ? 'webp' : e.name]
    if (st.size > max) fail(`${e.name}: ${Math.round(st.size / 1000)} kB - o máximo é ${max / 1000} kB`)
  }
  for (const f of expected) if (!existsSync(join(dir, f))) fail(`falta ${f}`)
  if (!existsSync(join(dir, 'template.tsx'))) return

  // 2. Código, lido sem executar
  const source = readFileSync(join(dir, 'template.tsx'), 'utf8')
  const sourceIssues = auditSource(source)
  sourceIssues.forEach((i) => fail(`template.tsx:${i.line}: ${i.message}`))
  if (sourceIssues.length) return // não se executa código que não passou

  // 3. Compilar e comparar com o template.json enviado
  const mod = (await import(join(dir, 'template.tsx'))) as { default?: FC }
  if (typeof mod.default !== 'function') { fail('template.tsx tem de exportar o template por omissão'); return }
  let template
  try { template = compile(createElement(mod.default)) } catch (e) { fail((e as Error).message); return }
  const generated = JSON.parse(JSON.stringify(importJson(meta, slug, template)))
  let committed: unknown
  try { committed = JSON.parse(readFileSync(join(dir, 'template.json'), 'utf8')) } catch { fail('template.json não é JSON válido') }
  if (committed !== undefined && !isDeepStrictEqual(committed, generated)) {
    fail('template.json não corresponde ao template.tsx - gere-o com `npm run templates -w packages/invoice` e não o edite à mão')
  }

  // 4. Segurança do conteúdo
  checkTemplate(template).forEach((i) => fail(`${i.path || 'template'}: ${i.message}`))

  // 5. Desenhar cada tipo e ver as pré-visualizações
  for (const dt of meta.docTypes) {
    const { warnings } = await render(template, sampleDocument(dt))
    warnings.forEach((w) => fail(`${dt}: ${w.message}`))
    const file = join(dir, `preview-${dt.toLowerCase()}.webp`)
    if (!existsSync(file)) continue
    try {
      const m = await sharp(file).metadata()
      if (m.format !== 'webp') fail(`preview-${dt.toLowerCase()}.webp não é WebP`)
      else if (m.width !== 900 || !m.height || m.height > 1400) fail(`preview-${dt.toLowerCase()}.webp tem ${m.width}×${m.height} - esperado 900 px de largura (gere-a com o script)`)
    } catch {
      fail(`preview-${dt.toLowerCase()}.webp não se consegue abrir`)
    }
  }
}

function readMeta(dir: string, fail: (m: string) => void): Meta | undefined {
  const file = join(dir, 'meta.json')
  if (!existsSync(file)) { fail('falta meta.json'); return }
  let m: Record<string, unknown>
  try { m = JSON.parse(readFileSync(file, 'utf8')) } catch { fail('meta.json não é JSON válido'); return }
  const slug = dir.split('/').pop()!

  const keys = ['slug', 'name', 'description', 'author', 'collection', 'version', 'license', 'docTypes', 'tags', 'updatedAt']
  for (const k of Object.keys(m)) if (!keys.includes(k)) fail(`meta.json: chave desconhecida "${k}"`)
  const text = (k: string, v: unknown, max: number) => {
    if (typeof v !== 'string' || !v.trim()) fail(`meta.json: ${k} em falta`)
    else if (v.length > max) fail(`meta.json: ${k} com mais de ${max} caracteres`)
    else if (INVISIBLE.test(v) || /[<>]/.test(v)) fail(`meta.json: ${k} tem caracteres não permitidos`)
  }
  if (m.slug !== slug) fail(`meta.json: slug tem de ser "${slug}" (o nome da pasta)`)
  text('name', m.name, 40)
  text('description', m.description, 160)

  const author = m.author as Record<string, unknown> | undefined
  if (!author || typeof author !== 'object') fail('meta.json: author em falta')
  else {
    for (const k of Object.keys(author)) if (k !== 'name' && k !== 'url') fail(`meta.json: author.${k} desconhecido`)
    const name = String(author.name ?? '')
    if (!GITHUB_LOGIN.test(name)) fail('meta.json: author.name tem de ser um nome de utilizador do GitHub')
    if (!maintainer) {
      if (RESERVED_AUTHORS.has(name.toLowerCase())) fail(`meta.json: o autor "${name}" está reservado`)
      if (prAuthor && name.toLowerCase() !== prAuthor.toLowerCase()) fail(`meta.json: author.name tem de ser o teu utilizador do GitHub ("${prAuthor}")`)
    }
    if (author.url !== undefined) {
      let ok = false
      try { const u = new URL(String(author.url)); ok = u.protocol === 'https:' && !u.username && !u.password } catch { /* inválido */ }
      if (!ok || String(author.url).length > 200) fail('meta.json: author.url tem de ser um endereço https://')
    }
  }

  if (!['vero', 'exemplos', 'comunidade'].includes(m.collection as string)) fail('meta.json: collection tem de ser "comunidade"')
  else if (!maintainer && m.collection !== 'comunidade') fail('meta.json: collection tem de ser "comunidade" - "vero" e "exemplos" são da equipa')
  if (!Number.isInteger(m.version) || (m.version as number) < 1) fail('meta.json: version tem de ser um inteiro ≥ 1')
  if (m.license !== 'MIT') fail('meta.json: license tem de ser "MIT"')
  const docTypes = m.docTypes as unknown[]
  if (!Array.isArray(docTypes) || !docTypes.length || docTypes.some((t) => !(DOC_TYPES as readonly unknown[]).includes(t)) || new Set(docTypes).size !== docTypes.length) {
    fail(`meta.json: docTypes tem de ser uma lista sem repetidos de ${DOC_TYPES.join(', ')}`)
    return
  }
  const tags = m.tags as unknown[]
  if (!Array.isArray(tags) || tags.length > 6 || tags.some((t) => typeof t !== 'string' || !/^[\p{L}\p{N} -]{1,20}$/u.test(t))) fail('meta.json: tags - até 6, cada uma com até 20 letras ou números')
  if (typeof m.updatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(m.updatedAt)) fail('meta.json: updatedAt no formato AAAA-MM-DD')
  return m as unknown as Meta
}

/** Resumo no separador da CI (GitHub Actions). */
function report() {
  const out = process.env.GITHUB_STEP_SUMMARY
  if (!out) return
  const lines = ['## Verificação dos templates', '']
  if (!slugs.length) lines.push('Nenhum template alterado.')
  for (const slug of slugs) {
    const p = failures.get(slug)
    lines.push(p ? `### ✗ \`${slug}\`\n${p.map((x) => `- ${x.replace(/\|/g, '\\|')}`).join('\n')}\n` : `- ✓ \`${slug}\``)
  }
  appendFileSync(out, lines.join('\n') + '\n')
}
