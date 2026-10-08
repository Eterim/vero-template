import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Braces, Check, Code2, Copy, Download, Eye, FileText, ListChecks, LoaderCircle, Radio, ShieldCheck, TriangleAlert } from 'lucide-react'
import type { RenderWarning, TemplateV2 } from '../../src/core/types'
import { downloadPdf, renderPages, type DocType } from './render'

interface Item { name: string; file: string }
interface Loaded { name: string; file: string; source: string; template?: TemplateV2; errors?: { component?: string; message: string }[]; ms: number }
type View = 'preview' | 'code' | 'json'

const DOC_TYPES: { id: DocType; label: string }[] = [
  { id: 'FT', label: 'Factura' }, { id: 'FR', label: 'Factura-recibo' }, { id: 'NC', label: 'Nota de crédito' }, { id: 'ND', label: 'Nota de débito' }, { id: 'RC', label: 'Recibo' },
]

const importJson = (name: string, t: TemplateV2) =>
  JSON.stringify({ format: 'vero-template', schemaVersion: 2, id: `local/${name}`, version: 1, name, template: t }, null, 2)

function useTemplates() {
  const [list, setList] = useState<{ dir: string; templates: Item[] } | null>(null)
  const refresh = useCallback(() => fetch('/api/templates').then((r) => r.json()).then(setList), [])
  useEffect(() => { void refresh() }, [refresh])
  return { list, refresh }
}

/** Liga ao servidor: cada gravação chega aqui. */
function useEvents(onEvent: (e: { type: string; name?: string; ok?: boolean; ms?: number }) => void) {
  const [connected, setConnected] = useState(false)
  const handler = useRef(onEvent)
  handler.current = onEvent
  useEffect(() => {
    const es = new EventSource('/api/events')
    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)
    es.onmessage = (m) => handler.current(JSON.parse(m.data))
    return () => es.close()
  }, [])
  return connected
}

function Pages({ template, docType, onWarnings, onMs }: { template: TemplateV2; docType: DocType; onWarnings: (w: RenderWarning[]) => void; onMs: (ms: number) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    setBusy(true)
    const width = Math.min((host.current?.clientWidth ?? 800) - 48, 820)
    renderPages(template, docType, width)
      .then((r) => { if (!alive || !host.current) return; host.current.replaceChildren(...r.canvases); onWarnings(r.warnings); onMs(r.ms); setError(null) })
      .catch((e) => alive && setError((e as Error).message))
      .finally(() => alive && setBusy(false))
    return () => { alive = false }
  }, [template, docType, onWarnings, onMs])
  return (
    <div className="relative h-full overflow-auto">
      {busy && <span className="absolute top-3 right-4 z-10 flex items-center gap-1.5 font-mono text-[11px] text-zinc-500"><LoaderCircle className="size-3 animate-spin" /> a desenhar</span>}
      {error && <p className="m-6 border border-red-900 bg-red-950/40 p-3 font-mono text-xs text-red-300">{error}</p>}
      <div ref={host} className="flex flex-col items-center gap-5 py-6 [&>canvas]:bg-white [&>canvas]:shadow-[0_0_0_1px_rgba(255,255,255,.06),0_30px_60px_-20px_rgba(0,0,0,.9)]" />
    </div>
  )
}

function Source({ text }: { text: string }) {
  return <pre className="h-full overflow-auto p-6 font-mono text-[12.5px] leading-relaxed text-zinc-300">{text}</pre>
}

export default function App() {
  const { list, refresh } = useTemplates()
  const [selected, setSelected] = useState<string | null>(() => decodeURIComponent(location.hash.slice(1)) || null)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [lastGood, setLastGood] = useState<TemplateV2 | null>(null)
  const [docType, setDocType] = useState<DocType>('FR')
  const [view, setView] = useState<View>('preview')
  const [warnings, setWarnings] = useState<RenderWarning[]>([])
  const [ms, setMs] = useState<{ compile: number; render: number } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!selected && list?.templates.length) setSelected(list.templates[0].name)
  }, [list, selected])

  const fetchTemplate = useCallback(async (name: string) => {
    const r: Loaded = await fetch(`/api/template?name=${encodeURIComponent(name)}`).then((x) => x.json())
    setLoaded(r)
    if (r.template) setLastGood(r.template)
    setMs((m) => ({ compile: r.ms, render: m?.render ?? 0 }))
  }, [])

  useEffect(() => {
    if (!selected) return
    history.replaceState(null, '', `#${encodeURIComponent(selected)}`)
    setLastGood(null)
    void fetchTemplate(selected)
  }, [selected, fetchTemplate])

  const connected = useEvents((e) => {
    if (e.type === 'list') void refresh()
    if (e.type === 'change' && e.name === selected) void fetchTemplate(e.name)
  })

  const onMs = useCallback((render: number) => setMs((m) => ({ compile: m?.compile ?? 0, render })), [])
  const template = loaded?.template ?? lastGood
  const errors = loaded?.errors ?? []
  const missing = warnings.filter((w) => w.kind === 'missing')
  const otherWarnings = warnings.filter((w) => w.kind !== 'missing')

  const copy = async () => {
    if (!template || !selected) return
    await navigator.clipboard.writeText(importJson(selected, template))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="grid h-full grid-cols-[250px_1fr]">
      {/* modelos */}
      <aside className="flex min-h-0 flex-col border-r border-zinc-900 bg-zinc-950">
        <div className="border-b border-zinc-900 px-4 py-4">
          <p className="text-sm font-black tracking-tight">@veroao/invoice <span className="font-mono text-[11px] font-normal text-zinc-500">dev</span></p>
          <p className="mt-1 truncate font-mono text-[11px] text-zinc-600">{list ? `${list.dir}/` : '…'}</p>
        </div>
        <nav className="min-h-0 flex-1 overflow-auto p-2">
          {list?.templates.map((t) => (
            <button key={t.name} type="button" onClick={() => setSelected(t.name)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${selected === t.name ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'}`}>
              <FileText className="size-3.5 shrink-0 opacity-60" /> <span className="truncate">{t.name}</span>
              {selected === t.name && loaded?.name === t.name && <span className={`ml-auto size-1.5 shrink-0 rounded-full ${loaded.errors ? 'bg-red-500' : 'bg-emerald-500'}`} />}
            </button>
          ))}
          {list && !list.templates.length && (
            <p className="px-3 py-4 text-xs leading-relaxed text-zinc-500">Nenhum modelo. Crie <span className="font-mono text-zinc-300">{list.dir}/factura.tsx</span> com <span className="font-mono text-zinc-300">export default</span>.</p>
          )}
        </nav>
        <p className={`flex items-center gap-2 border-t border-zinc-900 px-4 py-3 font-mono text-[11px] ${connected ? 'text-emerald-500' : 'text-zinc-600'}`}>
          <Radio className="size-3" /> {connected ? 'a vigiar alterações' : 'sem ligação ao servidor'}
        </p>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-col">
        {/* barra */}
        <header className="flex flex-wrap items-center gap-2 border-b border-zinc-900 px-4 py-2.5">
          <div className="mr-2 flex">
            {([['preview', 'Visualizar', Eye], ['code', 'Código', Code2], ['json', 'JSON', Braces]] as const).map(([id, label, Icon]) => (
              <button key={id} type="button" onClick={() => setView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold ${view === id ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}>
                <Icon className="size-3.5" /> {label}
              </button>
            ))}
          </div>
          {view === 'preview' && DOC_TYPES.map((d) => (
            <button key={d.id} type="button" onClick={() => setDocType(d.id)} title={d.label}
              className={`px-2.5 py-1 font-mono text-xs ${docType === d.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-200'}`}>{d.id}</button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {ms && <span className="font-mono text-[11px] text-zinc-600" title="compilar · desenhar">{ms.compile} + {ms.render} ms</span>}
            <button type="button" disabled={!template} onClick={() => template && selected && downloadPdf(template, docType, selected)}
              className="flex h-8 items-center gap-1.5 border border-zinc-800 px-3 text-xs font-semibold text-zinc-300 hover:border-zinc-600 disabled:opacity-40">
              <Download className="size-3.5" /> PDF
            </button>
            <button type="button" disabled={!template} onClick={copy}
              className="flex h-8 items-center gap-1.5 bg-white px-3 text-xs font-black text-black hover:bg-zinc-200 disabled:opacity-40">
              {copied ? <><Check className="size-3.5" /> Copiado</> : <><Copy className="size-3.5" /> JSON para o Vero</>}
            </button>
          </div>
        </header>

        {/* erros de compilação */}
        {errors.length > 0 && (
          <div className="border-b border-red-900/60 bg-red-950/30 px-5 py-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-red-300"><AlertCircle className="size-4" /> {loaded?.file}: {errors.length} {errors.length === 1 ? 'problema' : 'problemas'}{lastGood && <span className="font-normal text-red-400/70"> - a mostrar a última versão boa</span>}</p>
            <ul className="mt-2 space-y-1 font-mono text-[12px] text-red-200/90">
              {errors.map((e, i) => <li key={i}>{e.component && <span className="text-red-400">&lt;{e.component}&gt; </span>}{e.message}</li>)}
            </ul>
          </div>
        )}

        <div className="min-h-0 flex-1 bg-[radial-gradient(circle_at_50%_0%,#111113,#000_70%)]">
          {view === 'preview' && template && <Pages template={template} docType={docType} onWarnings={setWarnings} onMs={onMs} />}
          {view === 'preview' && !template && !errors.length && <p className="p-10 text-center font-mono text-sm text-zinc-600">// a carregar…</p>}
          {view === 'code' && loaded && <Source text={loaded.source} />}
          {view === 'json' && template && selected && <Source text={importJson(selected, template)} />}
        </div>

        {/* o que falta / avisos */}
        {view === 'preview' && template && (
          missing.length > 0 ? (
            <div className="border-t border-sky-900/60 bg-sky-950/30 px-5 py-2.5 text-xs text-sky-200">
              <p className="flex items-center gap-2 font-semibold"><ListChecks className="size-4" /> Faltam {missing.length} elementos obrigatórios (num documento emitido, são acrescentados):</p>
              <p className="mt-1 text-sky-200/80">{missing.map((w) => w.element.replace(/^(O|A|Os|As) /, '')).join(' · ')}</p>
            </div>
          ) : otherWarnings.length > 0 ? (
            <ul className="space-y-1 border-t border-amber-900/60 bg-amber-950/30 px-5 py-2.5 text-xs text-amber-200">
              {otherWarnings.map((w, i) => <li key={i} className="flex gap-2"><TriangleAlert className="mt-0.5 size-3.5 shrink-0" />{w.message}</li>)}
            </ul>
          ) : (
            <p className="flex items-center gap-2 border-t border-zinc-900 px-5 py-2.5 text-xs text-zinc-500"><ShieldCheck className="size-4 text-emerald-500" /> Tudo o que a AGT exige está no documento e lê-se bem.</p>
          )
        )}
      </main>
    </div>
  )
}
