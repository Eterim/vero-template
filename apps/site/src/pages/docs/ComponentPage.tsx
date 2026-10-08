import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Code2, Eye, ShieldCheck } from 'lucide-react'
import { Code } from '../../components/Code'
import { C, H2, PageTitle, Table, Ul } from '../../components/Prose'
import { examplesOf, findComponent, type Example } from '../../lib/components'
import { DocsLayout } from './DocsLayout'

function ExampleBlock({ e, file }: { e: Example; file: string }) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview')
  const [code, setCode] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    e.loadCode?.().then((t) => alive && setCode(t))
    return () => { alive = false }
  }, [e.loadCode])
  return (
    <section className="mt-10">
      <h3 className="text-[15px] font-bold text-zinc-100">{e.title}</h3>
      {e.description && <p className="mt-1 text-[13.5px] text-zinc-500">{e.description}</p>}
      <div className="mt-4 border border-zinc-800">
        <div className="flex border-b border-zinc-800 bg-zinc-950">
          {([['preview', 'Pré-visualização', Eye], ['code', 'Código', Code2]] as const).map(([id, label, Icon]) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              className={`-mb-px flex items-center gap-1.5 border-b px-4 py-2.5 text-[12.5px] font-semibold transition-colors ${tab === id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-200'}`}>
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>
        {tab === 'preview' ? (
          <div className="flex justify-center bg-[radial-gradient(circle_at_50%_30%,#18181b,#09090b)] px-4 py-8 sm:px-10">
            {e.image
              ? (
                // no telemóvel, a miniatura cortada à volta do conteúdo lê-se melhor do que a largura da página
                <picture className="contents">
                  {e.thumb && <source media="(max-width: 640px)" srcSet={e.thumb} />}
                  <img src={e.image} alt={e.title} loading="lazy" className="w-full max-w-[720px] shadow-[0_0_0_1px_rgba(255,255,255,.06),0_30px_60px_-20px_rgba(0,0,0,.9)]" />
                </picture>
              )
              : <p className="py-10 font-mono text-xs text-zinc-600">// sem imagem: npm run examples -w packages/invoice</p>}
          </div>
        ) : (
          code && <Code code={code.trim()} className="border-0" file={file} copyable />
        )}
      </div>
    </section>
  )
}

export default function ComponentPage() {
  const { slug = '' } = useParams()
  const c = findComponent(slug)
  if (!c) return <Navigate to="/componentes" replace />
  const examples = examplesOf(c)
  return (
    <DocsLayout key={slug}>
      <PageTitle eyebrow={`Componentes · ${c.group}`} lead={c.summary}>
        <span className="font-mono">{`<${c.name} />`}</span>
      </PageTitle>
      {c.required && (
        <p className="mt-6 flex items-start gap-2 border border-sky-900/60 bg-sky-950/20 px-4 py-3 text-[13.5px] text-sky-100/90">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-400" />
          Obrigatório pela AGT. Pode mudar de aspecto e de lugar; se faltar no template, é acrescentado ao emitir.
        </p>
      )}
      <Code className="mt-8" code={`import { ${c.name} } from "@veroao/invoice"`} />

      <H2>Exemplos</H2>
      {examples.map((e) => <ExampleBlock key={e.id} e={e} file={`examples/${c.slug}/${e.id}.tsx`} />)}

      <H2>Propriedades</H2>
      <Table head={['Nome', 'Tipo', 'Descrição']} rows={c.props.map((p) => [
        <C>{p.name}</C>,
        <span className="font-mono text-[12px] whitespace-nowrap text-sky-300/90">{p.type}</span>,
        <>{p.description}{p.default && <span className="mt-1 block text-[12px] text-zinc-600">Por omissão: <span className="font-mono">{p.default}</span></span>}</>,
      ])} />

      {c.notes && (
        <>
          <H2>Notas</H2>
          <Ul>{c.notes.map((n) => <li key={n}>{n}</li>)}</Ul>
        </>
      )}
    </DocsLayout>
  )
}
