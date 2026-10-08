/**
 * Pré-render (scripts/prerender.mjs): desenha cada página em HTML na build, para o Google
 * e as IAs lerem o conteúdo sem correr JavaScript. No browser o React volta a desenhar tudo.
 */
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { AppShell } from './App'
import { TEMPLATES } from './lib/templates'
import { DOC_PAGES } from './pages/docs/content'
import { COMPONENT_DOCS } from './lib/components'

export interface PageMeta {
  path: string
  title: string
  description: string
  /** Tipo para o JSON-LD e o llms.txt. */
  kind: 'home' | 'collection' | 'template' | 'doc' | 'component'
  /** Nome curto (migalhas de pão, llms.txt). */
  name: string
  /** Imagem de partilha: o slug do template (senão a imagem geral). */
  ogTemplate?: string
  /** Data da última alteração (AAAA-MM-DD), se se souber. */
  updatedAt?: string
  author?: string
}

const SITE = 'Vero Template'

export const PAGES: PageMeta[] = [
  { path: '/', kind: 'home', name: SITE, title: 'Vero Template - desenha o template das tuas facturas', description: 'Cansado da factura de sempre? Cria o template das tuas facturas em React e Tailwind CSS e usa-o no Vero. As regras da AGT vêm incluídas. Open source.' },
  { path: '/templates', kind: 'collection', name: 'Templates', title: `Templates de facturas - ${SITE}`, description: 'Templates de facturas, recibos e notas angolanas em React e Tailwind CSS, prontos a usar no Vero. Com as regras da AGT incluídas.' },
  ...TEMPLATES.map((t): PageMeta => ({
    path: `/templates/${t.slug}`, kind: 'template', name: t.name, ogTemplate: t.slug, updatedAt: t.updatedAt, author: t.author.name,
    title: `${t.name} - template de factura - ${SITE}`,
    description: `${t.description} Template de factura angolana em React e Tailwind CSS (${t.docTypes.join(', ')}), pronto a usar no Vero.`,
  })),
  { path: '/docs', kind: 'doc', name: 'Documentação', title: `Documentação - ${SITE}`, description: 'Documentação do @veroao/invoice: cria templates de facturas angolanas em React e Tailwind CSS, gera o PDF e usa-os no Vero.' },
  ...DOC_PAGES.map((d): PageMeta => ({ path: `/docs/${d.slug}`, kind: 'doc', name: d.title, title: `${d.title} - Documentação - ${SITE}`, description: `${d.title}: documentação do @veroao/invoice, a biblioteca de templates de facturas angolanas em React e Tailwind CSS.` })),
  { path: '/componentes', kind: 'component', name: 'Componentes', title: `Componentes - ${SITE}`, description: 'Os componentes React do @veroao/invoice para facturas angolanas: documento, cliente, linhas, totais, menções legais e mais.' },
  ...COMPONENT_DOCS.map((c): PageMeta => ({ path: `/componentes/${c.slug}`, kind: 'component', name: `<${c.name}>`, title: `<${c.name}> - Componentes - ${SITE}`, description: c.summary })),
]

/** Templates da galeria, para a imagem de partilha de cada um. */
export const GALLERY = TEMPLATES.map((t) => ({ slug: t.slug, name: t.name }))

export function render(path: string): string {
  return renderToString(
    <StaticRouter location={path}>
      <AppShell />
    </StaticRouter>,
  )
}
