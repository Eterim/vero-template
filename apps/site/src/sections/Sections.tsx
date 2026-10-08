import { useState } from 'react'
import {
  ArrowRight, Blocks, Braces, Calculator, Check, Contrast, Copy, Fingerprint, GitPullRequest, Hash, LayoutTemplate,
  ListChecks, Lock, Palette, Plus, QrCode, Rocket, ScanText, ShieldCheck, Terminal, TriangleAlert, Type, Wrench,
} from 'lucide-react'
import { Code } from '../components/Code'
import { CopyCommand } from '../components/CopyCommand'
import { Eyebrow } from '../components/Logo'
import { GithubIcon } from '../components/GithubIcon'
import { LINKS } from '../lib/links'
import { Link } from 'react-router-dom'
import { TEMPLATES } from '../lib/templates'
import { TemplateCard } from '../pages/Templates'

const container = 'mx-auto max-w-6xl px-4 sm:px-6'

function Title({ children, sub, center }: { children: React.ReactNode; sub?: React.ReactNode; center?: boolean }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <h2 className="text-3xl font-black tracking-tighter text-balance sm:text-5xl">{children}</h2>
      {sub && <p className="mt-4 text-[17px] leading-relaxed text-pretty text-zinc-400">{sub}</p>}
    </div>
  )
}

// ── 1. Tailwind | Estilos ─────────────────────────────────────────────────────

const TAILWIND = `import { Document, Section, Row, Logo, DocumentTitle, DocumentNumber,
  Customer, Issuer, Items, Totals, LegalNotes } from "@veroao/invoice"

export default function Moderno() {
  return (
    <Document className="bg-white font-sans text-[11px] text-zinc-900">
      <Section className="px-12 pt-10">
        <Row className="items-start justify-between">
          <Logo className="h-12" />
          <DocumentTitle className="text-4xl font-bold uppercase text-teal-900" />
        </Row>
      </Section>

      <Section className="px-12 py-6">
        <Row className="gap-6">
          <Customer className="flex-1 border border-zinc-300 p-3" />
          <Issuer className="flex-1" />
        </Row>
        <DocumentNumber className="mt-6 font-bold uppercase" />
        <Items className="mt-3" headerClassName="bg-zinc-100 font-bold"
          rowClassName="border-b border-zinc-200 even:bg-zinc-50" />
        <Totals className="ml-auto mt-4 w-1/2 border border-zinc-300" />
        <LegalNotes className="mt-6 text-[9px] text-zinc-500" />
      </Section>
    </Document>
  )
}`

const INLINE = `import { Document, Section, Row, Logo, DocumentTitle, DocumentNumber,
  Customer, Issuer, Items, Totals, LegalNotes } from "@veroao/invoice"

export default function Moderno() {
  return (
    <Document style={{ backgroundColor: "#fff", fontSize: 11 }}>
      <Section style={{ paddingHorizontal: 48, paddingTop: 40 }}>
        <Row style={{ alignItems: "flex-start", justifyContent: "space-between" }}>
          <Logo style={{ height: 48 }} />
          <DocumentTitle style={{ fontSize: 36, fontWeight: 700, color: "#134e4a" }} />
        </Row>
      </Section>

      <Section style={{ paddingHorizontal: 48, paddingVertical: 24 }}>
        <Row style={{ gap: 24 }}>
          <Customer style={{ flex: 1, borderWidth: 1, padding: 12 }} />
          <Issuer style={{ flex: 1 }} />
        </Row>
        <Items style={{ marginTop: 12 }} />
        <Totals style={{ marginLeft: "auto", width: "50%" }} />
        <LegalNotes style={{ marginTop: 24, fontSize: 9 }} />
      </Section>
    </Document>
  )
}`

export function Showcase() {
  const [mode, setMode] = useState<'tailwind' | 'inline'>('tailwind')
  return (
    <section className="relative border-t border-zinc-900 py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_50%_70%_at_50%_0%,rgba(14,165,233,.10),transparent)]" />
      <div className={`relative ${container}`}>
        <Title center sub="Classes Tailwind ou estilos em objecto - como preferir. O resultado é um PDF.">Estilize com o que já conhece</Title>
        <div className="mt-8 flex justify-center">
          <div role="tablist" className="inline-flex border border-zinc-800 bg-zinc-950 p-1">
            {([['tailwind', 'Tailwind'], ['inline', 'Estilos']] as const).map(([id, label]) => (
              <button key={id} role="tab" aria-selected={mode === id} type="button" onClick={() => setMode(id)}
                className={`px-5 py-1.5 text-sm font-semibold transition-colors ${mode === id ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-10 grid overflow-hidden border border-zinc-800 bg-zinc-950 lg:grid-cols-[1.15fr_1fr]">
          <Code code={mode === 'tailwind' ? TAILWIND : INLINE} file="templates/moderno.tsx"
            className="min-w-0 border-0 [&_pre]:h-[560px] [&_pre]:text-[12px]" />
          <div className="relative flex items-center justify-center border-t border-zinc-800 bg-[radial-gradient(circle_at_50%_40%,#18181b,#09090b)] p-8 lg:border-t-0 lg:border-l">
            <img src={`${import.meta.env.BASE_URL}previews/vero-moderno.webp`} alt="O PDF gerado pelo código ao lado" loading="lazy" width={900} height={1272}
              className="w-full max-w-[340px] shadow-[0_30px_60px_-15px_rgba(0,0,0,.9)]" />
            <span className="absolute top-3 right-3 font-mono text-[10px] text-zinc-600">FR · A4</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── 2. Regras da AGT (tiles, como "Battle-tested primitives") ─────────────────

const RULES = [
  { icon: QrCode, label: 'Código QR' },
  { icon: Hash, label: 'Série e número' },
  { icon: Fingerprint, label: 'ATCUD' },
  { icon: ScanText, label: 'NIF das partes' },
  { icon: Calculator, label: 'IVA por taxa' },
  { icon: Contrast, label: 'Contraste' },
  { icon: Lock, label: 'Certificação' },
]

export function AgtRules() {
  return (
    <section className="border-t border-zinc-900 py-24 sm:py-32">
      <div className={container}>
        <Eyebrow icon={ShieldCheck}>Feito para a AGT</Eyebrow>
        <div className="mt-4">
          <Title sub="O que a facturação electrónica exige vem de origem e não se desliga. O QR fica sempre no canto inferior direito da última página.">
            Liberdade no aspecto. Nenhuma no que a lei exige.
          </Title>
        </div>
        <ul className="mt-12 flex flex-wrap gap-x-5 gap-y-7">
          {RULES.map((r) => (
            <li key={r.label} className="flex w-[84px] flex-col items-center gap-2.5 text-center">
              <span className="flex size-[60px] items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,.1)]">
                <r.icon className="size-6 text-zinc-200" />
              </span>
              <span className="text-xs leading-tight text-zinc-400">{r.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ── 3. Componentes (cartões com mini-ilustrações) ─────────────────────────────

const bar = (w: string, c = 'bg-zinc-700') => <span className={`block h-1.5 rounded-full ${c}`} style={{ width: w }} />

const COMPONENTS: { name: string; slug: string; tag: string; art: React.ReactNode }[] = [
  {
    name: 'Cabeçalho', slug: 'document-title', tag: '<DocumentTitle />',
    art: (
      <div className="flex w-40 items-start justify-between rounded border border-zinc-800 bg-zinc-900/60 p-3">
        <span className="size-5 rounded bg-zinc-600" />
        <span className="flex flex-col items-end gap-1.5">{bar('56px', 'bg-sky-400')}{bar('34px')}</span>
      </div>
    ),
  },
  {
    name: 'Partes', slug: 'customer', tag: '<Customer /> <Issuer />',
    art: (
      <div className="flex gap-2">
        {[0, 1].map((i) => (
          <div key={i} className={`flex w-[72px] flex-col gap-1.5 rounded border p-2.5 ${i ? 'border-zinc-800' : 'border-sky-500/40 bg-sky-500/5'}`}>
            {bar('40px', i ? 'bg-zinc-600' : 'bg-sky-400')}{bar('52px')}{bar('30px')}
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'Artigos', slug: 'items', tag: '<Items />',
    art: (
      <div className="w-44 overflow-hidden rounded border border-zinc-800">
        <div className="flex gap-2 bg-zinc-800 px-2.5 py-1.5">{bar('50%', 'bg-zinc-500')}{bar('20%', 'bg-zinc-500')}</div>
        {[0, 1, 2].map((i) => (
          <div key={i} className={`flex gap-2 px-2.5 py-1.5 ${i % 2 ? 'bg-zinc-900' : ''}`}>{bar('50%')}{bar('20%', i === 1 ? 'bg-sky-400' : 'bg-zinc-700')}</div>
        ))}
      </div>
    ),
  },
  {
    name: 'Totais', slug: 'totals', tag: '<Totals />',
    art: (
      <div className="flex w-36 flex-col gap-1.5 rounded border border-zinc-800 p-3">
        {[0, 1, 2].map((i) => <div key={i} className="flex justify-between">{bar('40px')}{bar('22px')}</div>)}
        <div className="mt-1 flex justify-between border-t border-zinc-700 pt-2">{bar('34px', 'bg-zinc-400')}{bar('40px', 'bg-sky-400')}</div>
      </div>
    ),
  },
  {
    name: 'Menções legais', slug: 'legal-notes', tag: '<LegalNotes />',
    art: (
      <div className="flex w-44 items-end gap-3">
        <div className="flex flex-1 flex-col gap-1.5">{bar('100%')}{bar('85%')}{bar('60%')}</div>
        <div className="grid size-11 grid-cols-3 gap-0.5 rounded border border-zinc-700 bg-white p-1">
          {Array.from({ length: 9 }, (_, i) => <span key={i} className={[0, 2, 4, 6, 7].includes(i) ? 'bg-black' : ''} />)}
        </div>
      </div>
    ),
  },
  {
    name: 'Faixas e secções', slug: 'row', tag: '<Header /> <Row />',
    art: (
      <div className="flex w-40 flex-col gap-1.5">
        <div className="h-5 rounded-sm bg-sky-500/80" />
        <div className="flex gap-1.5"><div className="h-8 flex-1 rounded-sm border border-dashed border-zinc-700" /><div className="h-8 flex-1 rounded-sm border border-dashed border-zinc-700" /></div>
        <div className="h-3 rounded-sm bg-zinc-800" />
      </div>
    ),
  },
]

export function Components() {
  return (
    <section id="componentes" className="border-t border-zinc-900 py-24 sm:py-32">
      <div className={container}>
        <Eyebrow icon={Blocks}>Componentes</Eyebrow>
        <div className="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <Title sub="Os dados vêm de cada documento: linhas, IVA, totais, NIF. O componente desenha; o aspecto é seu.">Componentes que já sabem o que é uma factura.</Title>
          <Link to="/componentes" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white">Ver todos os componentes <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-12 grid gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
          {COMPONENTS.map((c) => (
            <Link key={c.name} to={`/componentes/${c.slug}`} className="group bg-black">
              <div className="flex h-40 items-center justify-center bg-[radial-gradient(circle_at_50%_50%,#111113,#000)] transition-colors group-hover:bg-[radial-gradient(circle_at_50%_50%,#16161a,#000)]">{c.art}</div>
              <div className="border-t border-zinc-900 px-5 py-4">
                <h3 className="text-sm font-bold">{c.name}</h3>
                <p className="mt-1 font-mono text-[11px] text-zinc-500">{c.tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── 4. Ferramentas fiscais (separadores, como as de entregabilidade) ──────────

const TOOLS = [
  { id: 'check', icon: ListChecks, title: 'Verificação fiscal', text: 'Diz o que falta para o documento ter tudo o que a AGT exige - e acrescenta com um clique.' },
  { id: 'contrast', icon: Contrast, title: 'Contraste', text: 'Texto fiscal que não se lê sobre o fundo é corrigido, e o editor diz porquê.' },
  { id: 'types', icon: LayoutTemplate, title: 'Cinco documentos, um template', text: 'Factura, factura-recibo, nota de crédito, nota de débito e recibo - todos a partir do mesmo template.' },
] as const

function ToolPanel({ id }: { id: (typeof TOOLS)[number]['id'] }) {
  if (id === 'check') {
    return (
      <div className="p-5">
        <p className="flex items-center gap-2 text-xs font-semibold text-sky-300"><ListChecks className="size-4" /> Para o template ficar completo, faltam 3 elementos</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['NIF do cliente', 'totais', 'menções legais'].map((x) => (
            <span key={x} className="flex items-center gap-1 rounded-full border border-sky-500/40 px-2.5 py-0.5 text-[11.5px] text-sky-200"><Plus className="size-3" /> {x}</span>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-zinc-500"><Check className="size-3 text-emerald-400" /> Código QR da AGT no sítio fixo</p>
      </div>
    )
  }
  if (id === 'contrast') {
    return (
      <div className="flex items-center gap-4 p-5">
        <span className="flex shrink-0 items-start gap-1.5">
          {[['#DB2777', 'escolhida'], ['#F4F4F5', 'fundo'], ['#111111', 'usada']].map(([c, l]) => (
            <span key={l} className="flex flex-col items-center gap-1"><span className="size-6 rounded border border-white/10" style={{ background: c }} /><span className="text-[9.5px] text-zinc-500">{l}</span></span>
          ))}
        </span>
        <p className="text-[12px] leading-snug text-amber-200/90"><TriangleAlert className="mr-1 inline size-3.5" />O Vero mudou a cor do nome e do NIF para a cor do texto do tema: a cor escolhida quase não se vê sobre este fundo.</p>
      </div>
    )
  }
  return (
    <div className="p-5">
      <div className="flex gap-1">
        {['FT', 'FR', 'NC', 'ND', 'RC'].map((t, i) => (
          <span key={t} className={`px-2.5 py-1 font-mono text-xs ${i === 1 ? 'bg-white text-black' : 'text-zinc-500'}`}>{t}</span>
        ))}
      </div>
      <p className="mt-4 font-mono text-[11.5px] text-zinc-400">FACTURA-RECIBO · FR VERO2026/57</p>
      <p className="mt-1 font-mono text-[11.5px] text-zinc-600">PAGO · Multicaixa Express</p>
    </div>
  )
}

export function Tools() {
  const [active, setActive] = useState<(typeof TOOLS)[number]['id']>('check')
  return (
    <section className="border-t border-zinc-900 py-24 sm:py-32">
      <div className={container}>
        <Title center sub="Antes de uma factura sair, o template é verificado - no editor e na emissão.">Ferramentas que conhecem a lei</Title>
        <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center [&>*]:min-w-0">
          <div className="space-y-2">
            {TOOLS.map((t) => (
              <button key={t.id} type="button" onClick={() => setActive(t.id)}
                className={`block w-full border p-5 text-left transition-colors ${active === t.id ? 'border-zinc-700 bg-zinc-950' : 'border-transparent hover:bg-zinc-950/60'}`}>
                <span className="flex items-center gap-2 font-bold"><t.icon className="size-4 text-sky-400" /> {t.title}</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-zinc-400">{t.text}</span>
              </button>
            ))}
          </div>
          <div className="overflow-hidden border border-zinc-800 bg-zinc-950">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-red-500/80" /><span className="size-2.5 rounded-full bg-amber-400/80" /><span className="size-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-zinc-500">npx @veroao/invoice dev</span>
            </div>
            <div className="grid sm:grid-cols-[1fr_190px]">
              <div className="min-h-[200px]"><ToolPanel id={active} /></div>
              <div className="hidden border-l border-zinc-800 bg-zinc-900/40 p-4 sm:block">
                <img src={`${import.meta.env.BASE_URL}previews/vero-classico.webp`} alt="" loading="lazy" width={900} height={1272} className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── 5. Como funciona ──────────────────────────────────────────────────────────

const STEPS = [
  { icon: Type, title: 'Escreva', text: 'Um .tsx com componentes React e Tailwind. Componentes seus, props, listas.' },
  { icon: Terminal, title: 'Veja ao vivo', text: 'npx @veroao/invoice dev: o PDF actualiza-se cada vez que grava.' },
  { icon: GitPullRequest, title: 'Publique', text: 'Um pull request e o template entra na galeria, com código e pré-visualização.' },
  { icon: Rocket, title: 'Use no Vero', text: 'Importe no Vero: certificação e dados reais entram em cada factura.' },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-zinc-900 py-24 sm:py-32">
      <div className={container}>
        <Eyebrow icon={Wrench}>Como funciona</Eyebrow>
        <div className="mt-4"><Title>Do editor ao PDF, sem sair do código.</Title></div>
        <ol className="mt-12 grid gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-black p-6">
              <span className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full border border-zinc-700 font-mono text-xs text-zinc-400">{i + 1}</span>
                <s.icon className="size-4 text-zinc-500" />
              </span>
              <h3 className="mt-5 font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ── 6. Templates ────────────────────────────────────────────────────────────────

export function Gallery() {
  const featured = TEMPLATES.slice(0, 4)
  return (
    <section id="templates" className="border-t border-zinc-900 py-24 sm:py-32">
      <div className={container}>
        <Eyebrow icon={Palette}>Templates</Eyebrow>
        <div className="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <Title sub="Pré-visualização, código para copiar e importação no Vero em cada um.">Comece de um template. Ou do zero.</Title>
          <Link to="/templates" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white">
            Ver os {TEMPLATES.length} templates <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {featured.map((t) => <TemplateCard key={t.slug} t={t} />)}
        </div>
      </div>
    </section>
  )
}

// ── 7. Usar no Vero ───────────────────────────────────────────────────────────

const JSON_SAMPLE = `{
  "template": "terracota",
  "version": 3,
  "author": "@fulano",
  "schemaVersion": 2,
  "theme": { "colors": { "brand": "#9A3412" } },
  "body": [ … ]
}`

export function UseInVero() {
  return (
    <section className="border-t border-zinc-900 py-24 sm:py-32">
      <div className={`grid gap-14 lg:grid-cols-2 lg:items-center [&>*]:min-w-0 ${container}`}>
        <div>
          <Eyebrow icon={Braces}>Usar no Vero</Eyebrow>
          <div className="mt-4">
            <Title sub="O template só traz o aspecto. Ao emitir, o Vero preenche a série, o ATCUD, a assinatura, o programa certificado, o QR e os dados reais.">
              Um clique e está nas suas facturas.
            </Title>
          </div>
          <ul className="mt-8 space-y-3 text-sm text-zinc-300">
            <li className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-emerald-400" /> O Vero recebe só um JSON - nunca executa código de terceiros.</li>
            <li className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-emerald-400" /> Valida o que é obrigatório e mostra a factura com os seus dados antes de aplicar.</li>
            <li className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-emerald-400" /> Cada factura fica presa à versão do template: reimprimir anos depois sai igual.</li>
          </ul>
        </div>
        <div className="border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold">Terracota</p>
              <p className="font-mono text-[11px] text-zinc-500">v3 · @fulano</p>
            </div>
            <div className="flex gap-2">
              <span className="flex h-9 items-center gap-1.5 border border-zinc-800 px-3 text-xs font-semibold text-zinc-300"><Copy className="size-3.5" /> Copiar JSON</span>
              <span className="flex h-9 items-center gap-1.5 bg-white px-3 text-xs font-black text-black">Abrir no Vero <ArrowRight className="size-3.5" /></span>
            </div>
          </div>
          <Code code={JSON_SAMPLE} file="terracota@3.json" className="mt-5 [&_pre]:text-[12px]" />
        </div>
      </div>
    </section>
  )
}

// ── 8. Open source ────────────────────────────────────────────────────────────

export function OpenSource() {
  return (
    <section className="relative overflow-hidden border-t border-zinc-900 py-28 text-center sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(ellipse_50%_60%_at_50%_100%,rgba(14,165,233,.14),transparent)]" />
      <div className={`relative ${container}`}>
        <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-tighter text-balance sm:text-6xl">Open source. Use, adapte, contribua.</h2>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-zinc-400">
          Licença MIT. Funciona sem o Vero - gere PDFs com os seus dados, no seu servidor. Com o Vero, importa qualquer template da galeria.
        </p>
        <div className="mt-9 flex justify-center"><CopyCommand command="npm install @veroao/invoice" /></div>
        <div className="mt-6 flex justify-center gap-3">
          <a href={LINKS.github} className="inline-flex h-10 items-center gap-2 border border-zinc-800 px-4 text-sm font-semibold text-zinc-200 hover:border-zinc-600"><GithubIcon /> GitHub</a>
          <a href={LINKS.npm} className="inline-flex h-10 items-center gap-2 border border-zinc-800 px-4 text-sm font-semibold text-zinc-200 hover:border-zinc-600">npm · v0.2.0</a>
        </div>
      </div>
    </section>
  )
}
