import type { ReactNode } from 'react'
import { Info, TriangleAlert } from 'lucide-react'

/** Peças de texto das páginas da documentação. */

export const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function PageTitle({ eyebrow, children, lead }: { eyebrow?: string; children: ReactNode; lead?: ReactNode }) {
  return (
    <header className="border-b border-zinc-900 pb-8">
      {eyebrow && <p className="font-mono text-[11px] tracking-wider text-sky-400 uppercase">{eyebrow}</p>}
      <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{children}</h1>
      {lead && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-400">{lead}</p>}
    </header>
  )
}

export function H2({ children }: { children: string }) {
  const id = slugify(children)
  return (
    <h2 id={id} className="group mt-12 scroll-mt-24 text-xl font-bold tracking-tight text-white">
      <a href={`#${id}`}>{children}<span className="ml-2 text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100">#</span></a>
    </h2>
  )
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 text-[15px] font-bold text-zinc-100">{children}</h3>
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[14.5px] leading-[1.75] text-zinc-400">{children}</p>
}

export function C({ children }: { children: ReactNode }) {
  return <code className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-px font-mono text-[12.5px] text-zinc-200">{children}</code>
}

export function Ul({ children }: { children: ReactNode }) {
  return <ul className="mt-4 space-y-2 text-[14.5px] leading-relaxed text-zinc-400 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:top-[0.7em] [&>li]:before:left-1 [&>li]:before:size-1 [&>li]:before:rounded-full [&>li]:before:bg-zinc-600">{children}</ul>
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-5 overflow-x-auto border border-zinc-800">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-zinc-950 text-[11px] tracking-wider text-zinc-500 uppercase">
          <tr>{head.map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-zinc-900">
          {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="px-4 py-3 align-top leading-relaxed text-zinc-400">{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  )
}

export function Callout({ kind = 'info', children }: { kind?: 'info' | 'warn'; children: ReactNode }) {
  const Icon = kind === 'warn' ? TriangleAlert : Info
  return (
    <div className={`mt-6 flex gap-3 border px-4 py-3 text-[13.5px] leading-relaxed ${kind === 'warn' ? 'border-amber-900/60 bg-amber-950/20 text-amber-100/90' : 'border-sky-900/60 bg-sky-950/20 text-sky-100/90'}`}>
      <Icon className={`mt-0.5 size-4 shrink-0 ${kind === 'warn' ? 'text-amber-400' : 'text-sky-400'}`} />
      <div>{children}</div>
    </div>
  )
}
