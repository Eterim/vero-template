// Depois da build: grava cada página com o HTML já desenhado (dist/<caminho>.html), com título,
// descrição, imagem de partilha e JSON-LD próprios, e ainda sitemap.xml, robots.txt, llms.txt e
// llms-full.txt (para as IAs). Ver src/entry-server.tsx.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const repo = join(root, '..', '..')
const dist = join(root, 'dist')
const ssrDir = join(root, 'dist-ssr')
const ORIGIN = process.env.SITE_ORIGIN ?? 'https://template.vero.ao'
const base = (process.env.SITE_BASE ?? '/').replace(/\/$/, '')
const url = (path) => `${ORIGIN}${base}${path === '/' ? '/' : path}`
const today = new Date().toISOString().slice(0, 10)

const { render, PAGES, GALLERY } = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href)
const shell = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ── Imagens de partilha (1200×630, JPG: o WhatsApp e o LinkedIn não mostram WebP) ──────────

const svgText = (title, sub) => Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <text x="72" y="118" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="700" fill="#38bdf8" letter-spacing="2">VERO TEMPLATE</text>
  ${title.map((l, i) => `<text x="72" y="${220 + i * 72}" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff">${esc(l)}</text>`).join('')}
  ${sub.map((l, i) => `<text x="72" y="${220 + title.length * 72 + 30 + i * 38}" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#a1a1aa">${esc(l)}</text>`).join('')}
  <text x="72" y="566" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#71717a">template.vero.ao · React + Tailwind · regras da AGT incluídas</text>
</svg>`)

async function ogImage(out, preview, title, sub) {
  const page = await sharp(preview).resize({ height: 540 }).toBuffer()
  const { width = 382 } = await sharp(page).metadata()
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000000' } })
    .composite([{ input: svgText(title, sub), left: 0, top: 0 }, { input: page, left: 1200 - width - 64, top: 45 }])
    .jpeg({ quality: 82 })
    .toFile(out)
}

mkdirSync(join(dist, 'og'), { recursive: true })
const defaultPreview = join(root, 'public', 'previews', 'vero-moderno.webp')
await ogImage(join(dist, 'og', 'vero-template.jpg'), defaultPreview, ['Facturas em', 'React e Tailwind'], ['Desenha o template das tuas facturas', 'e usa-o no Vero. Open source.'])
for (const t of GALLERY) {
  const preview = join(repo, 'templates', t.slug, 'preview-ft.webp')
  if (existsSync(preview)) await ogImage(join(dist, 'og', `${t.slug}.jpg`), preview, [t.name], ['Template de factura angolana', 'em React e Tailwind CSS'])
}
const ogFor = (p) => url(`/og/${p.ogTemplate && existsSync(join(dist, 'og', `${p.ogTemplate}.jpg`)) ? p.ogTemplate : 'vero-template'}.jpg`)

// ── JSON-LD ─────────────────────────────────────────────────────────────────────────────

const PUBLISHER = { '@type': 'Organization', name: 'Vero', url: 'https://vero.ao', logo: url('/apple-touch-icon.png') }
const WEBSITE = { '@type': 'WebSite', '@id': url('/#website'), name: 'Vero Template', url: url('/'), inLanguage: 'pt', publisher: PUBLISHER }

function breadcrumbs(p) {
  const parts = p.path.split('/').filter(Boolean)
  if (!parts.length) return null
  const section = { templates: 'Templates', docs: 'Documentação', componentes: 'Componentes' }[parts[0]]
  const items = [{ name: 'Vero Template', path: '/' }, { name: section, path: `/${parts[0]}` }]
  if (parts.length > 1) items.push({ name: p.name, path: p.path })
  return { '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: url(it.path) })) }
}

function jsonLd(p) {
  const graph = []
  if (p.kind === 'home') {
    graph.push(WEBSITE, {
      '@type': 'SoftwareSourceCode', name: '@veroao/invoice', description: p.description, url: url('/'),
      codeRepository: 'https://github.com/Eterim/vero-template', programmingLanguage: ['TypeScript', 'React'], license: 'https://opensource.org/licenses/MIT',
      runtimePlatform: 'Node.js', publisher: PUBLISHER, inLanguage: 'pt',
    })
  } else if (p.kind === 'collection') {
    graph.push({
      '@type': 'CollectionPage', name: p.title, description: p.description, url: url(p.path), isPartOf: { '@id': WEBSITE['@id'] },
      mainEntity: { '@type': 'ItemList', itemListElement: PAGES.filter((x) => x.kind === 'template').map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: url(x.path), name: x.name })) },
    })
  } else if (p.kind === 'template') {
    graph.push({
      '@type': 'CreativeWork', name: p.name, description: p.description, url: url(p.path), image: ogFor(p), inLanguage: 'pt',
      license: 'https://opensource.org/licenses/MIT', ...(p.updatedAt ? { dateModified: p.updatedAt } : {}),
      ...(p.author ? { author: { '@type': p.author === 'vero' ? 'Organization' : 'Person', name: p.author } } : {}),
      isPartOf: { '@id': WEBSITE['@id'] }, publisher: PUBLISHER,
    })
  } else {
    graph.push({ '@type': 'TechArticle', headline: p.name, description: p.description, url: url(p.path), inLanguage: 'pt', isPartOf: { '@id': WEBSITE['@id'] }, publisher: PUBLISHER })
  }
  const bc = breadcrumbs(p)
  if (bc) graph.push(bc)
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')
}

// ── Páginas ───────────────────────────────────────────────────────────────────────────

const bodies = new Map()
for (const page of PAGES) {
  const body = render(page.path)
  bodies.set(page.path, body)
  // Páginas da documentação: a descrição é a frase de introdução da própria página (senão
  // ficavam todas com o mesmo texto, o que o Google trata como duplicado).
  if (page.kind === 'doc' && page.path !== '/docs') {
    const lead = body.match(/<\/h1><p[^>]*>([\s\S]*?)<\/p>/)?.[1]?.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim()
    if (lead) page.description = `${lead} Documentação do @veroao/invoice: templates de facturas angolanas em React e Tailwind CSS.`
  }
  const head = [
    `<link rel="canonical" href="${url(page.path)}" />`,
    `<meta property="og:url" content="${url(page.path)}" />`,
    `<meta property="og:type" content="${page.kind === 'home' ? 'website' : 'article'}" />`,
    `<meta property="og:site_name" content="Vero Template" />`,
    `<meta property="og:locale" content="pt_AO" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${ogFor(page)}" />`,
    `<link rel="alternate" type="text/plain" title="llms.txt" href="${url('/llms.txt')}" />`,
    `<script type="application/ld+json">${jsonLd(page)}</script>`,
  ].map((l) => `    ${l}`).join('\n')
  const html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(page.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${ogFor(page)}$2`)
    .replace('</head>', `${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  // /templates/x -> templates/x.html: o GitHub Pages serve-o em /templates/x sem redireccionar
  // para /templates/x/ (o que aconteceria com templates/x/index.html).
  const out = page.path === '/' ? join(dist, 'index.html') : join(dist, `${page.path}.html`)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, html)
}

// ── Para as IAs: llms.txt (índice) e llms-full.txt (a documentação toda em texto) ─────────

/** HTML do <main> → Markdown simples (títulos, listas, código, parágrafos). */
function toMarkdown(html) {
  const main = html.match(/<main>([\s\S]*)<\/main>/)?.[1] ?? html
  const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  return decode(main
    .replace(/<(script|style|svg|nav|aside|button)[\s\S]*?<\/\1>/g, '')
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, (_, c) => `\n\n\`\`\`\n${c.replace(/<[^>]+>/g, '')}\n\`\`\`\n\n`)
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, (_, t) => `\n\n# ${t.replace(/<[^>]+>/g, '')}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, (_, t) => `\n\n## ${t.replace(/<[^>]+>/g, '')}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, (_, t) => `\n\n### ${t.replace(/<[^>]+>/g, '')}\n\n`)
    .replace(/<li[^>]*>/g, '\n- ')
    .replace(/<\/(p|div|tr|table|ul|ol|li)>/g, '\n')
    .replace(/<\/t[dh]>/g, ' | ')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/g, (_, c) => `\`${c.replace(/<[^>]+>/g, '')}\``)
    .replace(/<[^>]+>/g, ''))
    .split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trimEnd()).join('\n')
    .replace(/\n{3,}/g, '\n\n').trim()
}

const section = (kind) => PAGES.filter((p) => p.kind === kind && p.path.split('/').length > 2)
const line = (p) => `- [${p.name}](${url(p.path)}): ${p.description}`
writeFileSync(join(dist, 'llms.txt'), `# Vero Template

> Templates de facturas angolanas (factura, factura-recibo, notas de crédito e débito, recibo, pró-forma) em React e Tailwind CSS, com a biblioteca open source @veroao/invoice. As regras da AGT (Angola) vêm incluídas: o template só decide o aspecto; número, ATCUD, assinatura, QR, NIF, totais e menções legais vêm sempre dos dados do documento. Os templates usam-se no Vero (facturação electrónica certificada pela AGT) ou para gerar o PDF no teu próprio sistema.

- Instalar: \`npm install @veroao/invoice react\` ou \`npx @veroao/invoice init\`
- Código: https://github.com/Eterim/vero-template (MIT)
- Pacote: https://www.npmjs.com/package/@veroao/invoice
- Vero: https://vero.ao
- Skills para agentes de IA: \`npx skills add Eterim/veroao\` (skill vero-template)
- Documentação completa num só ficheiro: ${url('/llms-full.txt')}

## Documentação

${PAGES.filter((p) => p.kind === 'doc').map(line).join('\n')}

## Componentes

${PAGES.filter((p) => p.kind === 'component').map(line).join('\n')}

## Templates da galeria

${section('template').map(line).join('\n')}
`)

const fullOrder = [...PAGES.filter((p) => p.kind === 'doc' && p.path !== '/docs'), ...PAGES.filter((p) => p.kind === 'component' && p.path !== '/componentes')]
writeFileSync(join(dist, 'llms-full.txt'), `# Vero Template - documentação completa

> ${PAGES[0].description}
> Fonte: ${url('/')} · Código: https://github.com/Eterim/vero-template

${fullOrder.map((p) => `---\n\nFonte: ${url(p.path)}\n\n${toMarkdown(bodies.get(p.path))}`).join('\n\n')}
`)

// ── sitemap.xml e robots.txt ─────────────────────────────────────────────────────────────

writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((p) => `  <url><loc>${url(p.path)}</loc><lastmod>${p.updatedAt ?? today}</lastmod></url>`).join('\n')}
</urlset>
`)
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`)

// O 404.html continua a ser a casca vazia (rotas desconhecidas desenham-se no browser).
writeFileSync(join(dist, '404.html'), shell)
rmSync(ssrDir, { recursive: true, force: true })
console.log(`[prerender] ${PAGES.length} páginas, ${GALLERY.length + 1} imagens de partilha, sitemap.xml, llms.txt, llms-full.txt`)
