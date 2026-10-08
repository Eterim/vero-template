/**
 * Classes Tailwind → estilos do PDF. As medidas são as da web: 1 px = 0,75 pt
 * (a página A4 tem 794 px de largura, como no browser).
 *
 * Suportado: espaço (p/m/gap), tamanhos e cor do texto, peso, maiúsculas, espaço
 * entre letras e linhas, alinhamento, fundo, bordas (por lado), cantos, flex,
 * larguras e alturas, a paleta do Tailwind, as cores e letras do `config`, valores
 * livres ([#C9A227], [11px]) e o variante `even:` (linhas alternadas).
 * O resto dá erro a explicar porquê (num PDF não há hover, ecrãs nem sombras).
 */
import type { Border, Style } from '../core/types.js'
import { PALETTE } from './palette.js'

export const PX = 0.75
const pt = (px: number) => +(px * PX).toFixed(3)

export interface TailwindConfig {
  theme?: {
    extend?: {
      colors?: Record<string, string>
      fontFamily?: Record<string, string[] | string>
    }
  }
}

export interface ParsedClasses {
  style: Style
  /** Estilos com `even:` (só as linhas da tabela os usam). */
  even?: Style
  errors: string[]
}

const TEXT_SIZE: Record<string, number> = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60 }
const WEIGHT: Record<string, 400 | 600 | 700> = { thin: 400, extralight: 400, light: 400, normal: 400, medium: 600, semibold: 600, bold: 700, extrabold: 700, black: 700 }
const LEADING: Record<string, number> = { none: 1, tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2 }
const TRACKING_EM: Record<string, number> = { tighter: -0.05, tight: -0.025, normal: 0, wide: 0.025, wider: 0.05, widest: 0.1 }
const RADIUS: Record<string, number> = { none: 0, sm: 2, '': 4, md: 6, lg: 8, xl: 12, '2xl': 16, '3xl': 24, full: 9999 }
const FRACTION = /^(\d+)\/(\d+)$/
const DEFAULT_BORDER = '#e5e7eb' // como no Tailwind: gray-200

/** Ignoradas sem erro: no PDF a direcção vem de <Row>/<Column>. */
const NOOP = new Set(['flex', 'flex-row', 'flex-col', 'block', 'font-sans', 'normal-case', 'border-solid'])

const UNSUPPORTED: [RegExp, string][] = [
  [/^(hover|focus|active|group-hover|focus-within|focus-visible|disabled|visited):/, 'num PDF não há interacção (hover, focus…)'],
  [/^(sm|md|lg|xl|2xl|max-\w+|min-\[[^\]]+\]):/, 'um PDF tem sempre o tamanho A4 - não há ecrãs pequenos ou grandes'],
  [/^(dark|print|motion-\w+|portrait|landscape):/, 'num PDF não há modo escuro nem preferências do sistema'],
  [/^(shadow|drop-shadow|ring|blur|backdrop|opacity|mix-blend|bg-gradient|from-|via-|to-)/, 'o PDF não suporta sombras, desfoques, transparências nem degradês'],
  [/^(animate|transition|duration|ease|delay|transform|rotate|scale|translate|skew)/, 'um PDF não tem animações nem transformações'],
  [/^(grid|col-|row-|grid-)/, 'use <Row> e <Column> - o PDF não tem grelha CSS'],
  [/^(absolute|relative|fixed|sticky|top-|bottom-|left-|right-|inset|z-)/, 'o posicionamento é do Vero (ex.: o QR); use <Row>, <Column> e espaços'],
  [/^(space-[xy])/, 'use gap-* em vez de space-*'],
]

/** Resolve uma cor: do config (fica com o nome, ex.: "accent"), da paleta ou livre ([#hex]). */
function colorOf(v: string, theme: Record<string, string>): string | undefined {
  if (v in theme) return v
  if (v in PALETTE) return PALETTE[v]
  const free = /^\[(#[0-9a-fA-F]{3,8})\]$/.exec(v)
  if (free) return free[1].length === 4 ? `#${[...free[1].slice(1)].map((c) => c + c).join('')}` : free[1].slice(0, 7)
  return undefined
}

/** Medida: escala (n × 4 px), "px", [Npx], [Npt] → pt. */
function sizeOf(v: string): number | undefined {
  if (v === '0') return 0
  if (v === 'px') return pt(1)
  if (/^\d+(\.\d+)?$/.test(v)) return pt(Number(v) * 4)
  const free = /^\[(-?\d+(?:\.\d+)?)(px|pt)?\]$/.exec(v)
  if (free) return free[2] === 'pt' ? Number(free[1]) : pt(Number(free[1]))
  return undefined
}

function borderWidth(v: string | undefined): number | undefined {
  if (v === undefined) return pt(1)
  if (v === '0') return 0
  if (/^\d+$/.test(v)) return pt(Number(v))
  return sizeOf(v)
}

const SPACING: Record<string, (keyof Style)[]> = {
  p: ['padding'], px: ['paddingX'], py: ['paddingY'], pt: ['paddingTop'], pb: ['paddingBottom'], pl: ['paddingLeft'], pr: ['paddingRight'],
  mt: ['marginTop'], mb: ['marginBottom'], ml: ['marginLeft'], mr: ['marginRight'], mx: ['marginLeft', 'marginRight'], my: ['marginTop', 'marginBottom'],
  gap: ['gap'],
}

function applyOne(cls: string, s: Style, sides: Record<'all' | 't' | 'b' | 'l' | 'r', Partial<Border>>, theme: Record<string, string>, tracking: { em?: number }): string | null {
  if (NOOP.has(cls)) return null

  // espaço
  const sp = /^(-?)(p|px|py|pt|pb|pl|pr|mt|mb|ml|mr|mx|my|gap)-(.+)$/.exec(cls)
  if (sp) {
    const [, neg, key, v] = sp
    if (v === 'auto' && ['ml', 'mr', 'mx'].includes(key)) { SPACING[key].forEach((k) => ((s as Record<string, unknown>)[k] = 'auto')); return null }
    const n = sizeOf(v)
    if (n === undefined) return `"${cls}": valor desconhecido`
    SPACING[key].forEach((k) => ((s as Record<string, unknown>)[k] = neg ? -n : n))
    return null
  }

  // texto
  if (cls === 'uppercase') { s.uppercase = true; return null }
  if (cls === 'font-display' || cls === 'font-serif') { s.font = 'display'; return null }
  if (cls.startsWith('font-')) {
    const w = WEIGHT[cls.slice(5)]
    if (w) { s.weight = w; return null }
    return `"${cls}": peso ou letra desconhecida (use font-normal, font-semibold, font-bold ou font-display)`
  }
  if (cls === 'text-left' || cls === 'text-center' || cls === 'text-right') { s.align = cls.slice(5) as Style['align']; return null }
  if (cls.startsWith('text-')) {
    const v = cls.slice(5)
    if (TEXT_SIZE[v]) { s.size = pt(TEXT_SIZE[v]); return null }
    const free = /^\[(\d+(?:\.\d+)?)(px|pt)?\]$/.exec(v)
    if (free) { s.size = free[2] === 'pt' ? Number(free[1]) : pt(Number(free[1])); return null }
    const c = colorOf(v, theme)
    if (c) { s.color = c; return null }
    return `"${cls}": cor ou tamanho desconhecido`
  }
  if (cls.startsWith('leading-')) {
    const v = cls.slice(8)
    const n = LEADING[v] ?? (/^\[(\d+(?:\.\d+)?)\]$/.exec(v) ? Number(v.slice(1, -1)) : undefined)
    if (n === undefined) return `"${cls}": use leading-none/tight/snug/normal/relaxed/loose ou leading-[1.4]`
    s.lineHeight = n
    return null
  }
  if (cls.startsWith('tracking-')) {
    const v = cls.slice(9)
    if (v in TRACKING_EM) { tracking.em = TRACKING_EM[v]; return null }
    const n = sizeOf(v)
    if (n === undefined) return `"${cls}": valor desconhecido`
    s.letterSpacing = n
    return null
  }

  // fundo
  if (cls.startsWith('bg-')) {
    const c = colorOf(cls.slice(3), theme)
    if (!c) return `"${cls}": cor desconhecida`
    s.background = c
    return null
  }

  // bordas: border, border-2, border-[0.5px], border-t, border-t-2, border-{cor}, border-t-{cor}
  const b = /^border(?:-([tblr]))?(?:-(.+))?$/.exec(cls)
  if (b) {
    const side = (b[1] ?? 'all') as 'all' | 't' | 'b' | 'l' | 'r'
    const v = b[2]
    const w = borderWidth(v)
    if (w !== undefined) { sides[side].width = w; return null }
    const c = colorOf(v!, theme)
    if (c) { sides[side].color = c; return null }
    return `"${cls}": espessura ou cor desconhecida`
  }

  // cantos
  if (cls === 'rounded' || cls.startsWith('rounded-')) {
    const v = cls === 'rounded' ? '' : cls.slice(8)
    const n = v in RADIUS ? pt(RADIUS[v]) : sizeOf(v)
    if (n === undefined) return `"${cls}": valor desconhecido`
    s.radius = n
    return null
  }

  // flex e alinhamento
  if (cls === 'flex-1') { s.flex = 1; return null }
  if (cls === 'flex-none') { s.flex = 0; return null }
  const fx = /^flex-\[(\d+(?:\.\d+)?)\]$/.exec(cls)
  if (fx) { s.flex = Number(fx[1]); return null }
  const it = /^items-(start|center|end)$/.exec(cls)
  if (it) { s.alignItems = it[1] as Style['alignItems']; return null }
  const js = /^justify-(start|center|end|between)$/.exec(cls)
  if (js) { s.justify = js[1] as Style['justify']; return null }

  // larguras e alturas
  const wh = /^(w|h|min-h)-(.+)$/.exec(cls)
  if (wh) {
    const [, k, v] = wh
    if (k === 'w' && v === 'full') { s.width = '100%'; return null }
    const f = FRACTION.exec(v)
    if (k === 'w' && f) { s.width = `${+((Number(f[1]) / Number(f[2])) * 100).toFixed(4)}%`; return null }
    const n = sizeOf(v)
    if (n === undefined) return `"${cls}": valor desconhecido`
    if (k === 'w') s.width = n
    else if (k === 'h') s.height = n
    else s.minHeight = n
    return null
  }

  return `"${cls}" não existe no @veroao/invoice`
}

function finish(s: Style, sides: Record<'all' | 't' | 'b' | 'l' | 'r', Partial<Border>>, tracking: { em?: number }) {
  const mk = (o: Partial<Border>, fallbackColor?: string): Border | undefined =>
    o.width === undefined && o.color === undefined ? undefined : { width: o.width ?? pt(1), color: o.color ?? fallbackColor ?? DEFAULT_BORDER }
  // só cor ("border-linhas") não desenha contorno: dá a cor aos lados que tiverem espessura
  const all = sides.all.width !== undefined ? mk(sides.all) : undefined
  if (all && all.width > 0) s.border = all
  // "border border-b-2" ou "border-b border-x": um lado herda a cor geral
  const side = (k: 't' | 'b' | 'l' | 'r') => mk(sides[k], sides.all.color)
  const t = side('t'), b = side('b'), l = side('l'), r = side('r')
  if (t) s.borderTop = t
  if (b) s.borderBottom = b
  if (l) s.borderLeft = l
  if (r) s.borderRight = r
  if (tracking.em !== undefined) s.letterSpacing = +(tracking.em * (s.size ?? 9)).toFixed(3)
}

/** Converte uma string de classes. Nunca lança: os erros vêm em `errors`. */
export function parseClasses(className: string | undefined, theme: Record<string, string> = {}): ParsedClasses {
  const out: ParsedClasses = { style: {}, errors: [] }
  if (!className) return out
  const base = { all: {}, t: {}, b: {}, l: {}, r: {} } as Record<'all' | 't' | 'b' | 'l' | 'r', Partial<Border>>
  const evenSides = { all: {}, t: {}, b: {}, l: {}, r: {} } as Record<'all' | 't' | 'b' | 'l' | 'r', Partial<Border>>
  const tracking: { em?: number } = {}
  const evenTracking: { em?: number } = {}
  let even: Style | undefined

  for (const raw of className.split(/\s+/).filter(Boolean)) {
    const bad = UNSUPPORTED.find(([re]) => re.test(raw))
    if (bad) { out.errors.push(`"${raw}": ${bad[1]}`); continue }
    if (raw.startsWith('even:')) {
      even ??= {}
      const err = applyOne(raw.slice(5), even, evenSides, theme, evenTracking)
      if (err) out.errors.push(err)
      continue
    }
    if (raw.startsWith('odd:') || raw.startsWith('first:') || raw.startsWith('last:')) {
      out.errors.push(`"${raw}": só existe "even:" (linhas alternadas da tabela)`)
      continue
    }
    const err = applyOne(raw, out.style, base, theme, tracking)
    if (err) out.errors.push(err)
  }
  finish(out.style, base, tracking)
  if (even) { finish(even, evenSides, evenTracking); out.even = even }
  return out
}

/** Cores do config (nome → hex) e letras (body / display). */
export function themeFromConfig(config: TailwindConfig | undefined) {
  const ext = config?.theme?.extend ?? {}
  const colors: Record<string, string> = {}
  for (const [k, v] of Object.entries(ext.colors ?? {})) colors[k] = v
  const first = (v: string[] | string | undefined) => (Array.isArray(v) ? v[0] : v)
  return {
    colors,
    fonts: { body: first(ext.fontFamily?.sans), display: first(ext.fontFamily?.display ?? ext.fontFamily?.serif) },
  }
}
