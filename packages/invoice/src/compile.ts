/**
 * compile(): executa o template React uma vez e devolve o template em JSON (TemplateV2) -
 * só aspecto, sem código. É este JSON que o Vero guarda e desenha na emissão.
 *
 * A árvore é percorrida sem o React DOM: funcionam componentes próprios, fragmentos,
 * listas (.map) e condições; hooks não (um template não tem estado).
 */
import { Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'
import { VERO_KIND, type ItemColumn, type PdfStyle } from './components/index.js'
import { parseClasses, themeFromConfig, type TailwindConfig } from './tailwind/tailwind.js'
import type { Block, Border, Style, TemplateV2 } from './core/types.js'

export interface CompileIssue { component: string; message: string }

export class CompileError extends Error {
  constructor(public issues: CompileIssue[]) {
    super(`O template tem ${issues.length} ${issues.length === 1 ? 'problema' : 'problemas'}:\n${issues.map((i) => `- <${i.component}> ${i.message}`).join('\n')}`)
    this.name = 'CompileError'
  }
}

const FONTS = new Set(['Inter', 'Playfair Display', 'Helvetica', 'Times-Roman'])

/**
 * Aspecto por omissão de rótulos e tabelas, quando o template não passa classes
 * (ex.: <Customer /> sem labelClassName). O renderizador procura-os por estes nomes.
 */
const DEFAULT_STYLES: Record<string, Style> = {
  label: { size: 7, weight: 700, uppercase: true, letterSpacing: 0.4, color: '#71717a', marginBottom: 4 },
  tableHeader: { size: 7.5, weight: 700, color: '#52525b', paddingX: 6, paddingY: 6, borderBottom: { width: 0.75, color: '#d4d4d8' } },
  tableRow: { paddingX: 6, paddingY: 6, borderBottom: { width: 0.5, color: '#e4e4e7' } },
  details: { size: 7, color: '#71717a', marginTop: 2 },
}

/** Estilos em objecto (pt) → estilo do template. */
function fromStyleObject(o: PdfStyle | undefined): Style {
  if (!o) return {}
  const s: Style = {}
  const border = (w?: number, c?: string): Border | undefined => (w === undefined ? undefined : { width: w, color: c ?? '#e5e7eb' })
  if (o.color) s.color = o.color
  if (o.backgroundColor) s.background = o.backgroundColor
  if (o.fontSize !== undefined) s.size = o.fontSize
  if (o.fontWeight !== undefined) s.weight = o.fontWeight === 'bold' || (typeof o.fontWeight === 'number' && o.fontWeight >= 700) ? 700 : typeof o.fontWeight === 'number' && o.fontWeight >= 500 ? 600 : 400
  if (o.fontFamily) s.font = o.fontFamily
  if (o.textAlign) s.align = o.textAlign
  if (o.textTransform === 'uppercase') s.uppercase = true
  if (o.letterSpacing !== undefined) s.letterSpacing = o.letterSpacing
  if (o.lineHeight !== undefined) s.lineHeight = o.lineHeight
  if (o.padding !== undefined) s.padding = o.padding
  if (o.paddingHorizontal !== undefined) s.paddingX = o.paddingHorizontal
  if (o.paddingVertical !== undefined) s.paddingY = o.paddingVertical
  if (o.paddingTop !== undefined) s.paddingTop = o.paddingTop
  if (o.paddingBottom !== undefined) s.paddingBottom = o.paddingBottom
  if (o.paddingLeft !== undefined) s.paddingLeft = o.paddingLeft
  if (o.paddingRight !== undefined) s.paddingRight = o.paddingRight
  if (o.margin !== undefined) { s.marginTop = s.marginBottom = s.marginLeft = s.marginRight = o.margin }
  if (o.marginHorizontal !== undefined) s.marginLeft = s.marginRight = o.marginHorizontal
  if (o.marginVertical !== undefined) s.marginTop = s.marginBottom = o.marginVertical
  if (o.marginTop !== undefined) s.marginTop = o.marginTop
  if (o.marginBottom !== undefined) s.marginBottom = o.marginBottom
  if (o.marginLeft !== undefined) s.marginLeft = o.marginLeft
  if (o.marginRight !== undefined) s.marginRight = o.marginRight
  if (o.gap !== undefined) s.gap = o.gap
  if (o.flex !== undefined) s.flex = o.flex
  if (o.width !== undefined) s.width = o.width
  if (o.height !== undefined) s.height = o.height
  if (o.borderRadius !== undefined) s.radius = o.borderRadius
  const all = border(o.borderWidth, o.borderColor)
  if (all) s.border = all
  const t = border(o.borderTopWidth, o.borderTopColor ?? o.borderColor); if (t) s.borderTop = t
  const b = border(o.borderBottomWidth, o.borderBottomColor ?? o.borderColor); if (b) s.borderBottom = b
  const l = border(o.borderLeftWidth, o.borderLeftColor ?? o.borderColor); if (l) s.borderLeft = l
  const FLEX = { 'flex-start': 'start', center: 'center', 'flex-end': 'end', 'space-between': 'between' } as const
  if (o.alignItems) s.alignItems = FLEX[o.alignItems] as Style['alignItems']
  if (o.justifyContent) s.justify = FLEX[o.justifyContent] as Style['justify']
  return s
}

const isEmpty = (s: Style) => Object.keys(s).length === 0
const clean = <T extends Record<string, unknown>>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T

type Element = ReactElement<Record<string, unknown>>

class Compiler {
  issues: CompileIssue[] = []
  theme: Record<string, string> = {}

  constructor(private componentName: (el: Element) => string) {}

  classes(component: string, prop: string, className: unknown) {
    if (className !== undefined && typeof className !== 'string') {
      this.issues.push({ component, message: `${prop} tem de ser texto` })
      return { style: {} as Style, errors: [] } as ReturnType<typeof parseClasses>
    }
    const r = parseClasses(className, this.theme)
    r.errors.forEach((e) => this.issues.push({ component, message: `${prop}: ${e}` }))
    return r
  }

  /** className + style → estilo (o objecto sobrepõe-se às classes). */
  style(component: string, props: Record<string, unknown>): Style {
    return { ...this.classes(component, 'className', props.className).style, ...fromStyleObject(props.style as PdfStyle) }
  }

  /** Expande componentes próprios, fragmentos e listas até aos componentes do Vero. */
  expand(node: ReactNode): (Element | string)[] {
    if (node === null || node === undefined || typeof node === 'boolean') return []
    if (typeof node === 'string' || typeof node === 'number') return [String(node)]
    if (Array.isArray(node)) return node.flatMap((n) => this.expand(n))
    if (!isValidElement(node)) return []
    const el = node as Element
    if (el.type === Fragment) return this.expand(el.props.children as ReactNode)
    if (typeof el.type === 'function') {
      if ((el.type as unknown as Record<symbol, string>)[VERO_KIND]) return [el]
      if ((el.type as { prototype?: { isReactComponent?: unknown } }).prototype?.isReactComponent) {
        this.issues.push({ component: this.componentName(el), message: 'componentes de classe não são suportados - use funções' })
        return []
      }
      try {
        return this.expand((el.type as (p: unknown) => ReactNode)(el.props))
      } catch (e) {
        const msg = (e as Error).message
        this.issues.push({ component: this.componentName(el), message: /hook|Invalid hook call|useState|useEffect|useContext/i.test(msg) ? 'hooks não são suportados - um template não tem estado' : `erro ao executar: ${msg}` })
        return []
      }
    }
    if (typeof el.type === 'string') {
      this.issues.push({ component: el.type, message: 'elementos HTML não existem num PDF - use <Row>, <Column>, <Text>…' })
      return []
    }
    this.issues.push({ component: 'desconhecido', message: 'elemento não suportado' })
    return []
  }

  kind(el: Element) { return (el.type as unknown as Record<symbol, string>)[VERO_KIND] }

  text(children: ReactNode): string {
    return this.expand(children).map((x) => (typeof x === 'string' ? x : '')).join('')
  }

  blocks(children: ReactNode, where: string): Block[] {
    const out: Block[] = []
    for (const x of this.expand(children)) {
      if (typeof x === 'string') {
        if (x.trim()) this.issues.push({ component: where, message: `texto solto ("${x.trim().slice(0, 30)}") - ponha-o dentro de <Text>` })
        continue
      }
      const b = this.block(x)
      if (b) out.push(b)
    }
    return out
  }

  block(el: Element): Block | null {
    const p = el.props
    const kind = this.kind(el)
    const name = this.componentName(el)
    const style = this.style(name, p)
    const withStyle = <T extends Record<string, unknown>>(b: T) => clean({ ...b, style: isEmpty(style) ? undefined : style }) as unknown as Block
    const sub = (prop: string) => { const s = this.classes(name, prop, p[prop]).style; return isEmpty(s) ? undefined : s }
    const str = (k: string) => (typeof p[k] === 'string' ? (p[k] as string) : undefined)
    const bool = (k: string) => (typeof p[k] === 'boolean' ? (p[k] as boolean) : undefined)
    const borderColor = (prop: string) => {
      const s = this.classes(name, prop, p[prop]).style
      return s.border?.color ?? s.borderTop?.color ?? s.borderBottom?.color ?? s.color
    }

    switch (kind) {
      case 'row': return withStyle({ type: 'row', children: this.blocks(p.children as ReactNode, name) })
      case 'stack': return withStyle({ type: 'stack', children: this.blocks(p.children as ReactNode, name) })
      case 'text': return withStyle({ type: 'text', text: this.text(p.children as ReactNode) })
      case 'spacer': {
        const { height, ...rest } = style
        return clean({ type: 'spacer', size: typeof height === 'number' ? height : 12, style: isEmpty(rest) ? undefined : rest }) as unknown as Block
      }
      case 'divider': {
        const b = style.borderTop ?? style.border
        return clean({ type: 'divider', width: b?.width, color: b?.color }) as unknown as Block
      }
      case 'logo': {
        const { height, ...rest } = style
        return clean({
          type: 'logo', height: typeof height === 'number' ? height : undefined, fallback: str('fallback') as 'name' | 'none' | undefined,
          fallbackStyle: sub('fallbackClassName'), style: isEmpty(rest) ? undefined : rest,
        }) as unknown as Block
      }
      case 'documentTitle': return withStyle({ type: 'documentTitle', withCode: bool('withCode') })
      case 'documentNumber': return withStyle({ type: 'documentNumber', prefix: str('prefix') })
      case 'documentDate': return withStyle({ type: 'documentDate', prefix: str('prefix'), withTime: bool('withTime') })
      case 'atcud': return withStyle({ type: 'atcud', prefix: str('prefix') })
      case 'statusBadge': return withStyle({ type: 'statusBadge' })
      case 'party:issuer':
      case 'party:customer':
        return withStyle({
          type: 'party', role: kind === 'party:issuer' ? 'issuer' : 'customer', label: str('label'), taxIdLabel: str('taxIdLabel'),
          labelStyle: sub('labelClassName'), nameStyle: sub('nameClassName'),
        })
      case 'payment': return withStyle({ type: 'payment', label: str('label'), labelStyle: sub('labelClassName') })
      case 'items': {
        const row = this.classes(name, 'rowClassName', p.rowClassName)
        const grid = this.classes(name, 'gridClassName', p.gridClassName).style
        const cols = Array.isArray(p.columns) ? (p.columns as ItemColumn[]).map((c) => clean({
          field: c.field, label: c.label, flex: c.width,
          style: (() => { const s = this.classes(name, `columns[${c.field}].className`, c.className).style; return isEmpty(s) ? undefined : s })(),
        })) : undefined
        return withStyle({
          type: 'items',
          headerStyle: sub('headerClassName'),
          rowStyle: isEmpty(row.style) ? undefined : row.style,
          zebra: row.even?.background,
          detailsStyle: sub('detailsClassName'),
          grid: grid.border ?? undefined,
          showCurrency: bool('showCurrency'),
          columns: cols,
        })
      }
      case 'totals': {
        const rowRule = this.classes(name, 'rowClassName', p.rowClassName).style
        const totalRow = this.classes(name, 'totalRowClassName', p.totalRowClassName).style
        return withStyle({
          type: 'totals', title: str('title'), totalLabel: str('totalLabel'), byRate: bool('byRate'), showCurrency: bool('showCurrency'),
          titleStyle: sub('titleClassName'), totalStyle: sub('totalClassName'),
          ruleColor: p.ruleClassName ? borderColor('ruleClassName') : undefined,
          rowRule: rowRule.borderBottom?.color ?? rowRule.border?.color,
          totalBackground: totalRow.background,
          totalColor: totalRow.color,
        })
      }
      case 'notes': return withStyle({ type: 'notes', label: str('label'), inline: bool('inline'), labelStyle: sub('labelClassName') })
      case 'amountInWords': return withStyle({ type: 'amountInWords', label: str('label'), inline: bool('inline'), labelStyle: sub('labelClassName') })
      case 'bank': {
        const grid = this.classes(name, 'gridClassName', p.gridClassName).style
        return withStyle({
          type: 'bank', label: str('label'), layout: str('layout') as 'list' | 'table' | undefined,
          labelStyle: sub('labelClassName'), headerStyle: sub('headerClassName'), grid: grid.border ?? undefined,
        })
      }
      case 'fiscal': return withStyle({ type: 'fiscal', parts: Array.isArray(p.parts) ? p.parts : undefined })
      case 'pageNumber': return withStyle({ type: 'pageNumber' })
      default:
        this.issues.push({ component: name, message: kind === 'header' || kind === 'footer' || kind === 'corner' ? 'só pode estar directamente dentro de <Document>' : 'não pode estar aqui' })
        return null
    }
  }

  document(el: Element, config: TailwindConfig | undefined): TemplateV2 {
    const { colors, fonts } = themeFromConfig(config)
    this.theme = colors
    for (const [k, f] of Object.entries(fonts)) {
      if (f && !FONTS.has(f)) this.issues.push({ component: 'Tailwind', message: `fontFamily.${k === 'body' ? 'sans' : 'display'}: "${f}" não está disponível - use ${[...FONTS].join(', ')}` })
    }
    const p = el.props
    const style = this.style('Document', p)
    const { background, paddingX, paddingTop, ...base } = style
    const t: TemplateV2 = {
      version: 2,
      theme: clean({
        colors: { background: '#FFFFFF', foreground: '#111111', ...colors },
        fonts: clean({ body: fonts.body as never, display: (fonts.display ?? fonts.body) as never }),
        styles: { ...DEFAULT_STYLES, ...(isEmpty(base) ? {} : { body: base }) },
      }),
      page: clean({ background, marginX: paddingX, marginTop: paddingTop }),
      body: [],
    }
    for (const x of this.expand(p.children as ReactNode)) {
      if (typeof x === 'string') { if (x.trim()) this.issues.push({ component: 'Document', message: 'texto solto - ponha-o dentro de <Text>' }); continue }
      const kind = this.kind(x)
      if (kind === 'corner') {
        t.page = clean({ ...t.page, corner: true, cornerColor: typeof x.props.color === 'string' ? x.props.color : undefined })
      } else if (kind === 'header') {
        const s = this.style('Header', x.props)
        t.top = clean({ style: isEmpty(s) ? undefined : s, children: this.blocks(x.props.children as ReactNode, 'Header') }) as TemplateV2['top']
      } else if (kind === 'footer') {
        const { height, ...s } = this.style('Footer', x.props)
        t.bottom = clean({ height: typeof height === 'number' ? height : undefined, style: isEmpty(s) ? undefined : s, children: this.blocks(x.props.children as ReactNode, 'Footer') }) as TemplateV2['bottom']
      } else {
        const b = this.block(x)
        if (b) t.body.push(b)
      }
    }
    if (!t.page || isEmpty(t.page as Style)) delete t.page
    return t
  }
}

const nameOf = (el: Element) => {
  const t = el.type as { displayName?: string; name?: string } | string
  return typeof t === 'string' ? t : t.displayName ?? t.name ?? 'Componente'
}

/**
 * Transforma o template React no JSON que o Vero importa. Lança CompileError com a lista
 * de problemas (classes que não existem num PDF, elementos HTML, hooks…).
 */
export function compile(element: ReactNode): TemplateV2 {
  const c = new Compiler(nameOf)
  const roots = c.expand(element).filter((x): x is Element => typeof x !== 'string')
  let config: TailwindConfig | undefined
  let doc: Element | undefined
  for (const r of roots) {
    const kind = c.kind(r)
    if (kind === 'tailwind') {
      config = r.props.config as TailwindConfig | undefined
      doc = c.expand(r.props.children as ReactNode).find((x): x is Element => typeof x !== 'string' && c.kind(x) === 'document')
    } else if (kind === 'document') doc = r
  }
  if (!doc) throw new CompileError([...c.issues, { component: 'Document', message: 'o template tem de devolver um <Document> (opcionalmente dentro de <Tailwind>)' }])
  const template = c.document(doc, config)
  if (c.issues.length) throw new CompileError(c.issues)
  return template
}
