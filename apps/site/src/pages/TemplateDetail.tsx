import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Braces, Check, Code2, Copy, Download, Eye, FileText, Scale, Tag } from 'lucide-react'
import { Code } from '../components/Code'
import { CopyCommand } from '../components/CopyCommand'
import { DOC_TYPE_LABEL, findTemplate, type DocType, type Template } from '../lib/templates'
import { LINKS } from '../lib/links'

type Tab = 'preview' | 'code' | 'json'

function useRaw(load: () => Promise<string>) {
  const [text, setText] = useState<string | null>(null)
  useEffect(() => { let alive = true; load().then((t) => alive && setText(t)); return () => { alive = false } }, [load])
  return text
}

function CopyJsonButton({ t }: { t: Template }) {
  const [state, setState] = useState<'idle' | 'copied'>('idle')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(await t.loadJson())
      setState('copied')
      setTimeout(() => setState('idle'), 1800)
    } catch { /* sem permissão para a área de transferência */ }
  }
  return (
    <button type="button" onClick={copy}
      className="inline-flex h-10 items-center gap-2 border border-zinc-800 bg-zinc-950 px-4 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600">
      {state === 'copied' ? <><Check className="size-4 text-emerald-400" /> JSON copiado</> : <><Copy className="size-4" /> Copiar JSON</>}
    </button>
  )
}

function Preview({ t }: { t: Template }) {
  const types = (Object.keys(DOC_TYPE_LABEL) as DocType[]).filter((d) => t.previews[d])
  const [doc, setDoc] = useState<DocType>(types.includes('fr') ? 'fr' : types[0])
  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {types.map((d) => (
          <button key={d} type="button" onClick={() => setDoc(d)} title={DOC_TYPE_LABEL[d]}
            className={`px-3 py-1.5 font-mono text-xs transition-colors ${doc === d ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-200'}`}>
            {d.toUpperCase()}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-zinc-500">{DOC_TYPE_LABEL[doc]} · dados de exemplo</span>
      </div>
      <div className="mt-4 flex justify-center border border-zinc-800 bg-[radial-gradient(circle_at_50%_30%,#18181b,#09090b)] px-4 py-10 sm:px-10">
        {/* todas as imagens no DOM: trocar de tipo é imediato */}
        {types.map((d) => (
          <img key={d} src={t.previews[d]} alt={`${t.name} - ${DOC_TYPE_LABEL[d]}`} width={900} height={1272}
            loading={d === doc ? 'eager' : 'lazy'}
            className={`w-full max-w-[620px] shadow-[0_0_0_1px_rgba(255,255,255,.06),0_40px_80px_-20px_rgba(0,0,0,.9)] ${d === doc ? '' : 'hidden'}`} />
        ))}
      </div>
    </div>
  )
}

function CodeTab({ t }: { t: Template }) {
  const code = useRaw(t.loadCode)
  if (code === null) return <p className="py-20 text-center font-mono text-sm text-zinc-600">// a carregar…</p>
  return (
    <div>
      <p className="mb-4 text-sm text-zinc-400">O modelo em React + Tailwind. Copia-o para o teu projecto e muda o que quiseres.</p>
      <Code code={code} file={`templates/${t.slug}/modelo.tsx`} copyable className="[&_pre]:max-h-[760px] [&_pre]:text-[12px]" />
    </div>
  )
}

function JsonTab({ t }: { t: Template }) {
  const json = useRaw(t.loadJson)
  if (json === null) return <p className="py-20 text-center font-mono text-sm text-zinc-600">// a carregar…</p>
  const download = () => {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `${t.slug}.json` })
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">Só o aspecto, sem código. É isto que o Vero importa e valida.</p>
        <button type="button" onClick={download} className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-white">
          <Download className="size-3.5" /> {t.slug}.json
        </button>
      </div>
      <Code code={json} file={`templates/${t.slug}/modelo.json`} copyable className="[&_pre]:max-h-[760px] [&_pre]:text-[12px]" />
    </div>
  )
}

function Sidebar({ t }: { t: Template }) {
  const info: [React.ReactNode, React.ReactNode][] = [
    ['Autor', <a href={t.author.url} className="text-zinc-200 hover:text-white">@{t.author.name}</a>],
    ['Versão', `v${t.version}`],
    ['Licença', t.license],
    ['Actualizado', new Date(t.updatedAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })],
    ['Documentos', t.docTypes.join(' · ')],
  ]
  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      <div className="border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold"><FileText className="size-4 text-sky-400" /> Usar no Vero</h2>
        <ol className="mt-4 space-y-3 text-[13px] leading-snug text-zinc-400">
          {['Copia o JSON deste modelo.', 'No Vero: Definições → Modelos → Importar.', 'Cola o JSON. O Vero valida e mostra a factura com os teus dados.', 'Aplica. A certificação e os dados reais entram em cada factura.'].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-zinc-700 font-mono text-[10px] text-zinc-400">{i + 1}</span>{s}
            </li>
          ))}
        </ol>
        <div className="mt-5 flex flex-col gap-2">
          <CopyJsonButton t={t} />
          <span title="Chega com a importação no dashboard do Vero"
            className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 bg-white/90 px-4 text-sm font-black text-black/60">
            Abrir no Vero <ArrowRight className="size-4" /> <span className="font-mono text-[10px] font-normal">em breve</span>
          </span>
        </div>
      </div>
      <div className="border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold"><Code2 className="size-4 text-sky-400" /> No teu projecto</h2>
        <div className="mt-4 [&_button]:w-full"><CopyCommand command="npm install @veroao/invoice" /></div>
        <p className="mt-3 text-[12px] leading-snug text-zinc-500">Copia o <span className="font-mono text-zinc-300">modelo.tsx</span> para o teu projecto e gera o PDF com <span className="font-mono text-zinc-300">render()</span>. <Link to="/docs/pdf" className="text-sky-400 hover:text-sky-300">Ver a documentação</Link></p>
      </div>
      <dl className="divide-y divide-zinc-900 border border-zinc-800 bg-zinc-950 px-5 text-[13px]">
        {info.map(([k, v]) => (
          <div key={String(k)} className="flex justify-between gap-4 py-3"><dt className="text-zinc-500">{k}</dt><dd className="text-right text-zinc-300">{v}</dd></div>
        ))}
      </dl>
    </aside>
  )
}

export default function TemplateDetail() {
  const { slug = '' } = useParams()
  const t = findTemplate(slug)
  const [tab, setTab] = useState<Tab>('preview')
  useEffect(() => { setTab('preview') }, [slug])

  if (!t) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-32 text-center sm:px-6">
        <p className="font-mono text-sm text-zinc-500">// 404</p>
        <h1 className="mt-3 text-3xl font-black tracking-tighter">Este modelo não existe.</h1>
        <Link to="/modelos" className="mt-6 inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300"><ArrowLeft className="size-4" /> Ver todos os modelos</Link>
      </div>
    )
  }

  const TABS: { id: Tab; label: React.ReactNode; icon: typeof Eye }[] = [
    { id: 'preview', label: 'Visualizar', icon: Eye },
    { id: 'code', label: 'Código', icon: Code2 },
    { id: 'json', label: <>JSON<span className="hidden sm:inline"> para o Vero</span></>, icon: Braces },
  ]

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_60%_80%_at_30%_0%,rgba(14,165,233,.1),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-28 sm:px-6">
        <nav className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <Link to="/modelos" className="hover:text-white">modelos</Link><span>/</span><span className="text-zinc-300">{t.slug}</span>
        </nav>
        <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter sm:text-6xl">{t.name}</h1>
            <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-zinc-400">{t.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5 border border-zinc-800 px-2 py-1"><img src="/vero-white.png" alt="" className="h-2.5 w-auto" /> @{t.author.name}</span>
              <span className="border border-zinc-800 px-2 py-1 font-mono">v{t.version}</span>
              <span className="flex items-center gap-1 border border-zinc-800 px-2 py-1"><Scale className="size-3" /> {t.license}</span>
              {t.tags.map((g) => <span key={g} className="flex items-center gap-1 px-1 py-1 text-zinc-600"><Tag className="size-3" />{g}</span>)}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] [&>*]:min-w-0">
          <div>
            <div role="tablist" className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-900">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} role="tab" aria-selected={tab === id} type="button" onClick={() => setTab(id)}
                  className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${tab === id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-200'}`}>
                  <Icon className="size-4" /> {label}
                </button>
              ))}
            </div>
            {tab === 'preview' && <Preview t={t} />}
            {tab === 'code' && <CodeTab t={t} />}
            {tab === 'json' && <JsonTab t={t} />}
          </div>
          <Sidebar t={t} />
        </div>
      </div>
    </div>
  )
}
