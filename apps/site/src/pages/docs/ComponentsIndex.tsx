import { Link } from 'react-router-dom'
import { COMPONENT_DOCS, COMPONENT_GROUPS, examplesOf } from '../../lib/components'
import { PageTitle } from '../../components/Prose'
import { DocsLayout } from './DocsLayout'

export default function ComponentsIndex() {
  return (
    <DocsLayout wide>
      <PageTitle eyebrow="Componentes" lead="Os dados vêm de cada documento; o componente desenha e o aspecto é teu. Os marcados a azul são obrigatórios pela AGT - se faltarem, são acrescentados ao emitir.">
        Componentes
      </PageTitle>
      {COMPONENT_GROUPS.map((g) => (
        <section key={g} className="mt-12">
          <h2 className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">{g}</h2>
          <div className="mt-4 grid border-t border-l border-zinc-800 sm:grid-cols-2 xl:grid-cols-3">
            {COMPONENT_DOCS.filter((c) => c.group === g).map((c) => {
              const first = examplesOf(c)[0]
              return (
                <Link key={c.slug} to={`/componentes/${c.slug}`} className="group flex flex-col border-r border-b border-zinc-800 bg-black">
                  <div className="flex h-44 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#141417,#000)] p-5">
                    {first?.thumb && (
                      <img src={first.thumb} alt="" loading="lazy"
                        className="max-h-full max-w-full object-contain shadow-[0_0_0_1px_rgba(255,255,255,.06),0_20px_40px_-12px_rgba(0,0,0,.9)] transition-transform duration-300 group-hover:scale-[1.03]" />
                    )}
                  </div>
                  <div className="flex-1 border-t border-zinc-900 px-5 py-4">
                    <h3 className="flex items-center gap-2 font-mono text-[13px] font-semibold text-white">
                      {`<${c.name} />`}
                      {c.required && <span title="Obrigatório pela AGT" className="size-1.5 rounded-full bg-sky-500" />}
                    </h3>
                    <p className="mt-1.5 text-[12.5px] leading-snug text-zinc-500">{c.summary}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </DocsLayout>
  )
}
