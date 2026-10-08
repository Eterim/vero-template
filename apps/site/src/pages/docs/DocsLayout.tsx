import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Menu, X } from 'lucide-react'
import { COMPONENT_DOCS, COMPONENT_GROUPS } from '../../lib/components'
import { DOC_PAGES } from './content'

interface NavItem { to: string; label: string; required?: boolean }

const SECTIONS: { title: string; items: NavItem[] }[] = [
  ...(['Começar', 'Guias'] as const).map((g) => ({
    title: g,
    items: DOC_PAGES.filter((d) => d.group === g).map((d) => ({ to: d.slug === 'introducao' ? '/docs' : `/docs/${d.slug}`, label: d.title })),
  })),
  { title: 'Componentes', items: [{ to: '/componentes', label: 'Visão geral' }] },
  ...COMPONENT_GROUPS.map((g) => ({
    title: g,
    items: COMPONENT_DOCS.filter((c) => c.group === g).map((c) => ({ to: `/componentes/${c.slug}`, label: c.name, required: c.required })),
  })),
]

/** Ordem de leitura: para "anterior / seguinte" no fim de cada página. */
const FLAT = SECTIONS.flatMap((s) => s.items)

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-7 text-[13.5px]">
      {SECTIONS.map((s) => (
        <div key={s.title}>
          <p className="mb-2 font-mono text-[10.5px] tracking-wider text-zinc-600 uppercase">{s.title}</p>
          <ul className="space-y-px border-l border-zinc-900">
            {s.items.map((i) => (
              <li key={i.to}>
                <NavLink to={i.to} end onClick={onNavigate}
                  className={({ isActive }) => `-ml-px flex items-center gap-2 border-l py-1.5 pl-4 transition-colors ${isActive ? 'border-white font-semibold text-white' : 'border-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-100'} ${s.title !== 'Começar' && s.title !== 'Guias' && i.label !== 'Visão geral' ? 'font-mono text-[12.5px]' : ''}`}>
                  {i.label}
                  {i.required && <span title="Obrigatório pela AGT" className="size-1.5 rounded-full bg-sky-500" />}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function Pager() {
  const { pathname } = useLocation()
  const i = FLAT.findIndex((x) => x.to === pathname.replace(/\/$/, ''))
  if (i < 0) return null
  const prev = FLAT[i - 1]
  const next = FLAT[i + 1]
  return (
    <div className="mt-16 grid gap-3 border-t border-zinc-900 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link to={prev.to} className="group border border-zinc-900 p-4 transition-colors hover:border-zinc-700">
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-500"><ArrowLeft className="size-3" /> Anterior</span>
          <span className="mt-1 block text-sm font-semibold text-zinc-200 group-hover:text-white">{prev.label}</span>
        </Link>
      ) : <span />}
      {next && (
        <Link to={next.to} className="group border border-zinc-900 p-4 text-right transition-colors hover:border-zinc-700">
          <span className="flex items-center justify-end gap-1.5 text-[11px] text-zinc-500">Seguinte <ArrowRight className="size-3" /></span>
          <span className="mt-1 block text-sm font-semibold text-zinc-200 group-hover:text-white">{next.label}</span>
        </Link>
      )}
    </div>
  )
}

export function DocsLayout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mx-auto flex max-w-7xl px-4 sm:px-6">
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-zinc-900 py-10 pr-6 lg:block">
        <Sidebar />
      </aside>
      <div className="min-w-0 flex-1 py-8 lg:py-12 lg:pl-12">
        {/* telemóvel: menu da documentação */}
        <button type="button" onClick={() => setOpen(true)}
          className="mb-8 flex items-center gap-2 border border-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-300 lg:hidden">
          <Menu className="size-4" /> Documentação
        </button>
        <article className={wide ? 'max-w-5xl' : 'max-w-3xl'}>
          {children}
          <Pager />
        </article>
      </div>
      {open && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black px-6 py-6 lg:hidden">
          <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="mb-6 flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <X className="size-4" /> Fechar
          </button>
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
