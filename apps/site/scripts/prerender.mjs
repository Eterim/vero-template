// Depois da build: grava dist/<página>/index.html com o HTML já desenhado e o título e a
// descrição de cada página, mais o sitemap.xml. Ver src/entry-server.tsx.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ssrDir = join(root, 'dist-ssr')
const ORIGIN = process.env.SITE_ORIGIN ?? 'https://template.vero.ao'
const base = (process.env.SITE_BASE ?? '/').replace(/\/$/, '')

const { render, PAGES } = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href)
const shell = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

for (const page of PAGES) {
  const url = `${ORIGIN}${base}${page.path === '/' ? '/' : page.path}`
  const html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(page.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace('</head>', `    <link rel="canonical" href="${url}" />\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${render(page.path)}</div>`)
  // /templates/x -> templates/x.html: o GitHub Pages serve-o em /templates/x sem redireccionar
  // para /templates/x/ (o que aconteceria com templates/x/index.html).
  const out = page.path === '/' ? join(dist, 'index.html') : join(dist, `${page.path}.html`)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, html)
}

writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((p) => `  <url><loc>${ORIGIN}${base}${p.path === '/' ? '/' : p.path}</loc></url>`).join('\n')}
</urlset>
`)
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}${base}/sitemap.xml\n`)
// O 404.html continua a ser a casca vazia (rotas desconhecidas desenham-se no browser).
writeFileSync(join(dist, '404.html'), shell)
rmSync(ssrDir, { recursive: true, force: true })
console.log(`[prerender] ${PAGES.length} páginas + sitemap.xml`)
