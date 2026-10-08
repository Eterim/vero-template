import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Palette } from 'lucide-react'
import { Eyebrow } from '../components/Logo'
import { TEMPLATES, type Template } from '../lib/templates'

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'vero', label: 'Do Vero' },
  { id: 'exemplos', label: 'Exemplos' },
  { id: 'comunidade', label: 'Comunidade' },
] as const

export function TemplateCard({ t }: { t: Template }) {
  return (
    <Link to={`/modelos/${t.slug}`} className="group block">
      <div className="overflow-hidden border border-zinc-800 bg-zinc-950 p-3 transition-colors group-hover:border-zinc-600">
        <img src={t.previews.fr ?? t.previews.ft} alt={`Modelo ${t.name}`} loading="lazy" width={900} height={1272}
          className="w-full transition-transform duration-500 group-hover:scale-[1.02]" />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold">{t.name}</span>
        <span className="font-mono text-[11px] text-zinc-600">@{t.author.name}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-zinc-500">{t.description}</p>
    </Link>
  )
}

export default function Templates() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('todos')
  const list = TEMPLATES.filter((t) => filter === 'todos' || t.collection === filter)
  const count = (id: string) => (id === 'todos' ? TEMPLATES.length : TEMPLATES.filter((t) => t.collection === id).length)
  return (
    <section className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,rgba(14,165,233,.12),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-28 sm:px-6">
        <Eyebrow icon={Palette}>Modelos</Eyebrow>
        <h1 className="mt-4 text-4xl font-black tracking-tighter sm:text-6xl">Escolhe. Adapta. Usa no Vero.</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-zinc-400">
          Cada modelo tem a pré-visualização dos cinco documentos, o código React e o JSON para importar no Vero.
          Fizeste o teu? Abre um pull request e ele aparece aqui.
        </p>
        <div role="tablist" className="mt-10 flex flex-wrap gap-1 border-b border-zinc-900">
          {FILTERS.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} type="button" onClick={() => setFilter(f.id)}
              className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${filter === f.id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-200'}`}>
              {f.label} <span className="ml-1 font-mono text-[11px] text-zinc-600">{count(f.id)}</span>
            </button>
          ))}
        </div>
        {list.length
          ? <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">{list.map((t) => <TemplateCard key={t.slug} t={t} />)}</div>
          : <p className="mt-16 text-center font-mono text-sm text-zinc-600">// ainda sem modelos aqui - o primeiro pode ser o teu</p>}
      </div>
    </section>
  )
}
