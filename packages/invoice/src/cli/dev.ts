/**
 * `npx @veroao/invoice dev` - local preview server. Finds the templates, compiles them on
 * every save and tells the browser (Server-Sent Events). The preview app is prebuilt and
 * ships with the package (dist/preview).
 */
import { createServer, type ServerResponse } from 'node:http'
import { existsSync, readdirSync, readFileSync, statSync, watch } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import { loadTemplate, type LoadResult } from './load.js'

const PREVIEW_DIR = new URL('../preview/', import.meta.url).pathname
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json',
}

export interface DevOptions { dir?: string; port: number }

/** Folder with the templates: the one given, templates/ (or the older modelos/), or the current folder. */
export function findDir(dir?: string): string {
  if (dir) return resolve(dir)
  for (const d of ['templates', 'modelos']) if (existsSync(d) && statSync(d).isDirectory()) return resolve(d)
  return resolve('.')
}

/** <dir>/<name>.tsx, or <dir>/<name>/template.tsx | index.tsx (the gallery layout). */
export function findTemplates(dir: string): Map<string, string> {
  const out = new Map<string, string>()
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_') || entry.name === 'node_modules') continue
    if (entry.isFile() && /\.(tsx|jsx)$/.test(entry.name)) out.set(entry.name.replace(/\.(tsx|jsx)$/, ''), join(dir, entry.name))
    if (entry.isDirectory()) {
      for (const f of ['template.tsx', 'index.tsx', 'template.jsx', 'index.jsx', 'modelo.tsx', 'modelo.jsx']) {
        const p = join(dir, entry.name, f)
        if (existsSync(p)) { out.set(entry.name, p); break }
      }
    }
  }
  return new Map([...out].sort(([a], [b]) => a.localeCompare(b)))
}

export async function dev(opts: DevOptions) {
  const dir = findDir(opts.dir)
  let files = findTemplates(dir)
  const cache = new Map<string, Promise<LoadResult>>()
  const load = (name: string) => {
    let p = cache.get(name)
    if (!p) { p = loadTemplate(files.get(name)!); cache.set(name, p) }
    return p
  }

  const clients = new Set<ServerResponse>()
  const broadcast = (data: unknown) => { for (const c of clients) c.write(`data: ${JSON.stringify(data)}\n\n`) }

  // Ao gravar: recompila (um ficheiro de template → só esse; outro ficheiro, ex. componentes partilhados → todos)
  let timer: NodeJS.Timeout | undefined
  const changed = new Set<string>()
  watch(dir, { recursive: true }, (_event, filename) => {
    if (!filename || /node_modules|\.git/.test(filename)) return
    changed.add(join(dir, filename.toString()))
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const paths = [...changed]
      changed.clear()
      files = findTemplates(dir)
      const names = [...files].filter(([, f]) => paths.includes(f)).map(([n]) => n)
      const affected = names.length ? names : [...files.keys()]
      affected.forEach((n) => cache.delete(n))
      for (const n of affected) {
        const r = await load(n)
        broadcast({ type: 'change', name: n, ok: !r.errors, ms: r.ms })
      }
      broadcast({ type: 'list' })
    }, 60)
  })

  const json = (res: ServerResponse, body: unknown, status = 200) => {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
    res.end(JSON.stringify(body))
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname === '/api/templates') {
      return json(res, { dir: relative(process.cwd(), dir) || '.', templates: [...files].map(([name, file]) => ({ name, file: relative(process.cwd(), file) })) })
    }
    if (url.pathname === '/api/template') {
      const name = url.searchParams.get('name') ?? ''
      if (!files.has(name)) return json(res, { error: 'not_found' }, 404)
      const r = await load(name)
      return json(res, { ...r, file: relative(process.cwd(), r.file) })
    }
    if (url.pathname === '/api/events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' })
      res.write('retry: 1000\n\n')
      clients.add(res)
      req.on('close', () => clients.delete(res))
      return
    }
    // a app de pré-visualização (SPA)
    const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1))
    let path = join(PREVIEW_DIR, rel)
    if (!path.startsWith(PREVIEW_DIR) || !existsSync(path) || statSync(path).isDirectory()) path = join(PREVIEW_DIR, 'index.html')
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream', 'cache-control': path.endsWith('index.html') ? 'no-store' : 'public, max-age=31536000, immutable' })
    res.end(readFileSync(path))
  })

  await new Promise<void>((ok, fail) => {
    server.once('error', fail)
    server.listen(opts.port, () => ok())
  }).catch((e: NodeJS.ErrnoException) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`\n  A porta ${opts.port} está ocupada. Use outra: npx @veroao/invoice dev --port ${opts.port + 1}\n`)
      process.exit(1)
    }
    throw e
  })

  const n = files.size
  console.log(`\n  @veroao/invoice dev\n`)
  console.log(`  → http://localhost:${opts.port}`)
  console.log(`  ${n ? `${n} ${n === 1 ? 'template' : 'templates'} em ${relative(process.cwd(), dir) || '.'}/` : `nenhum template em ${relative(process.cwd(), dir) || '.'}/ - crie um ficheiro .tsx com export default`}\n`)
}
