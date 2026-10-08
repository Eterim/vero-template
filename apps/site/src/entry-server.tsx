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

export interface PageMeta { path: string; title: string; description: string }

const SITE = 'Vero Template'

export const PAGES: PageMeta[] = [
  { path: '/', title: 'Vero Template - desenha o template das tuas facturas', description: 'Cansado da factura de sempre? Cria o template das tuas facturas em React e Tailwind CSS e usa-o no Vero. As regras da AGT vêm incluídas. Open source.' },
  { path: '/templates', title: `Templates de facturas - ${SITE}`, description: 'Templates de facturas, recibos e notas angolanas em React e Tailwind CSS, prontos a usar no Vero. Com as regras da AGT incluídas.' },
  ...TEMPLATES.map((t) => ({ path: `/templates/${t.slug}`, title: `${t.name} - template de factura - ${SITE}`, description: t.description })),
  { path: '/docs', title: `Documentação - ${SITE}`, description: 'Documentação do @veroao/invoice: cria templates de facturas angolanas em React e Tailwind CSS, gera o PDF e usa-os no Vero.' },
  ...DOC_PAGES.map((d) => ({ path: `/docs/${d.slug}`, title: `${d.title} - Documentação - ${SITE}`, description: `${d.title}: documentação do @veroao/invoice, a biblioteca de templates de facturas angolanas em React e Tailwind CSS.` })),
  { path: '/componentes', title: `Componentes - ${SITE}`, description: 'Os componentes React do @veroao/invoice para facturas angolanas: documento, cliente, linhas, totais, menções legais e mais.' },
  ...COMPONENT_DOCS.map((c) => ({ path: `/componentes/${c.slug}`, title: `<${c.name}> - Componentes - ${SITE}`, description: c.summary })),
]

export function render(path: string): string {
  return renderToString(
    <StaticRouter location={path}>
      <AppShell />
    </StaticRouter>,
  )
}
