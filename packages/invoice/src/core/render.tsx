import { createContext, useContext, type ReactNode } from 'react'
import { Document, Image, Page, Path, Polygon, Svg, Text, View, Font } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import { legible } from './color.js'
import { AGT_LOGO_DATA_URL } from './agt-logo.js'
import { ensureFiscalBlocks } from './fiscal.js'
import { FISCAL_PARTS, type Block, type DocumentData, type FiscalPart, type RenderWarning, type Style, type StyleRef, type TemplateV2 } from './types.js'

const PAGE_W = 595.28
const LEGAL_TITLE: Record<DocumentData['documentType'], string> = {
  FT: 'Factura', FR: 'Factura-Recibo', NC: 'Nota de Crédito', ND: 'Nota de Débito', RC: 'Recibo',
}
const STATUS_TEXT = { paid: 'PAGO', pending: 'POR PAGAR', cancelled: 'ANULADO' } as const

// ── Contexto: tema, dados, fundo actual (para o contraste do texto fiscal) ──

interface Ctx {
  t: TemplateV2
  data: DocumentData
  qr: QrData
  bg: string
  /** Cor de texto herdada (a do bloco mais próximo que a define). */
  fg: string
  /** Bloco a ser desenhado (para os avisos apontarem para ele). */
  at?: RenderWarning['at']
  warn: (w: RenderWarning) => void
}
/** QR em vector: n = módulos por lado; runs = rectângulos escuros [x, y, largura] em módulos. */
type QrData = { n: number; runs: [number, number, number][] }

const RenderCtx = createContext<Ctx>(null as unknown as Ctx)
const useCtx = () => useContext(RenderCtx)

function color(t: TemplateV2, ref: string | undefined): string | undefined {
  if (!ref) return undefined
  return ref.startsWith('#') ? ref : t.theme.colors[ref] ?? undefined
}

function merge(t: TemplateV2, ref: StyleRef | undefined): Style {
  if (!ref) return {}
  const list = Array.isArray(ref) ? ref : [ref]
  return Object.assign({}, ...list.map((r) => (typeof r === 'string' ? t.theme.styles?.[r] ?? {} : r)))
}

/** Junta estilos (objectos, nomes do tema ou listas) numa só lista. */
const join = (...refs: (StyleRef | undefined)[]): StyleRef => refs.flatMap((r) => (r === undefined ? [] : Array.isArray(r) ? r : [r]))

const FLEX: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' }

function pdfStyle(t: TemplateV2, s: Style): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (s.background) out.backgroundColor = color(t, s.background)
  if (s.color) out.color = color(t, s.color)
  if (s.font) out.fontFamily = t.theme.fonts?.[s.font] ?? 'Helvetica'
  if (s.size) out.fontSize = s.size
  if (s.weight) out.fontWeight = s.weight
  if (s.letterSpacing !== undefined) out.letterSpacing = s.letterSpacing
  if (s.uppercase) out.textTransform = 'uppercase'
  if (s.lineHeight) out.lineHeight = s.lineHeight
  if (s.align) out.textAlign = s.align
  if (s.padding !== undefined) out.padding = s.padding
  if (s.paddingX !== undefined) out.paddingHorizontal = s.paddingX
  if (s.paddingY !== undefined) out.paddingVertical = s.paddingY
  if (s.marginTop !== undefined) out.marginTop = s.marginTop
  if (s.marginBottom !== undefined) out.marginBottom = s.marginBottom
  if (s.paddingTop !== undefined) out.paddingTop = s.paddingTop
  if (s.paddingBottom !== undefined) out.paddingBottom = s.paddingBottom
  if (s.paddingLeft !== undefined) out.paddingLeft = s.paddingLeft
  if (s.paddingRight !== undefined) out.paddingRight = s.paddingRight
  if (s.marginLeft !== undefined) out.marginLeft = s.marginLeft
  if (s.marginRight !== undefined) out.marginRight = s.marginRight
  if (s.width !== undefined) out.width = s.width
  if (s.height !== undefined) out.height = s.height
  if (s.minHeight !== undefined) out.minHeight = s.minHeight
  if (s.gap !== undefined) out.gap = s.gap
  if (s.radius !== undefined) out.borderRadius = s.radius
  if (s.flex !== undefined) out.flex = s.flex
  if (s.alignItems) out.alignItems = FLEX[s.alignItems]
  if (s.justify) out.justifyContent = FLEX[s.justify]
  if (s.border) { out.borderWidth = s.border.width; out.borderColor = color(t, s.border.color) }
  for (const side of ['Top', 'Bottom', 'Left', 'Right'] as const) {
    const b = s[`border${side}`]
    if (b) { out[`border${side}Width`] = b.width; out[`border${side}Color`] = color(t, b.color) }
  }
  return out
}

/** Caixa com estilo; se tiver fundo, passa-o aos filhos para o controlo de contraste. */
function Box({ style, children, row, fixed, extra }: { style?: StyleRef; children?: ReactNode; row?: boolean; fixed?: boolean; extra?: Record<string, unknown> }) {
  const ctx = useCtx()
  const s = merge(ctx.t, style)
  const bg = color(ctx.t, s.background)
  const fg = color(ctx.t, s.color)
  const view = (
    <View fixed={fixed} style={{ ...(row ? { flexDirection: 'row' } : {}), ...pdfStyle(ctx.t, s), ...extra }}>{children}</View>
  )
  return bg || fg ? <RenderCtx.Provider value={{ ...ctx, bg: bg ?? ctx.bg, fg: fg ?? ctx.fg }}>{view}</RenderCtx.Provider> : view
}

/** "o NIF" → "do NIF", "as menções" → "das menções". */
const of = (el: string) => el.replace(/^(o|a|os|as) /i, (m) => `d${m.toLowerCase()}`)
const lower = (el: string) => el.charAt(0).toLowerCase() + el.slice(1)
const joinPt = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}`)

/** Como descrever uma cor a quem não vê o código: pelo papel no tema, ou pelo nome. */
function describeColor(t: TemplateV2, hex: string): string {
  const h = hex.toUpperCase()
  if (t.theme.colors.texto?.toUpperCase() === h) return 'a cor do texto do tema'
  const token = Object.entries(t.theme.colors).find(([, v]) => v.toUpperCase() === h)?.[0]
  if (token) return `a cor "${token}" do tema`
  if (h === '#000000') return 'preto'
  if (h === '#FFFFFF') return 'branco'
  return h
}

/** Frase do aviso a partir dos elementos afectados (vários elementos do mesmo bloco = um aviso). */
function warningMessage(t: TemplateV2, w: RenderWarning & { elements: string[] }): string {
  const what = joinPt(w.elements.map((e) => of(lower(e))))
  if (w.kind === 'contrast') {
    return `O Vero mudou a cor ${what} para ${describeColor(t, w.colors!.used)}: a cor escolhida quase não se vê sobre este fundo. Escolha uma cor mais escura ou mais clara.`
  }
  return `O Vero aumentou o tamanho ${what} para 7 pt: o texto fiscal tem de se ler quando é impresso.`
}

/**
 * Texto fiscal: o estilo é livre, mas a cor tem de se ler sobre o fundo onde está
 * (contraste mínimo 4,5) e o tamanho nunca desce de 7 pt.
 * `element` é o nome do que se está a desenhar, para os avisos ("O NIF").
 */
function FiscalText({ style, children, element }: { style?: StyleRef; children: ReactNode; element: string }) {
  const ctx = useCtx()
  const s = merge(ctx.t, style)
  const requested = color(ctx.t, s.color) ?? ctx.fg
  const { color: c, adjusted } = legible(requested, ctx.bg, [ctx.t.theme.colors.texto])
  if (adjusted) {
    ctx.warn({ kind: 'contrast', element, at: ctx.at, colors: { chosen: requested, background: ctx.bg, used: c }, message: '' })
  }
  const size = s.size !== undefined && s.size < 7 ? 7 : s.size
  if (size !== s.size) {
    ctx.warn({ kind: 'minSize', element, at: ctx.at, message: '' })
  }
  return <Text style={{ ...pdfStyle(ctx.t, s), color: c, ...(size ? { fontSize: size } : {}) }}>{children}</Text>
}

// ── Formatação ──

const money = (cents: number, currency: string, withSymbol = true) => {
  if (!withSymbol) return moneyNumber(cents)
  return `${moneyNumber(cents)} ${currency === 'AOA' ? 'Kz' : currency}`
}
const moneyNumber = (cents: number) => {
  const [int, dec] = (Math.abs(cents) / 100).toFixed(2).split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${cents < 0 ? '-' : ''}${grouped},${dec}`
}
const pad = (n: number) => String(n).padStart(2, '0')
const date = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
const time = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

function interpolate(text: string, data: DocumentData) {
  const vars: Record<string, string | null | undefined> = {
    'org.name': data.org.name, 'org.website': data.org.website, 'org.email': data.org.email, 'org.phone': data.org.phone,
    'customer.name': data.customer.name, 'document.reference': data.reference, 'document.number': data.number,
    'document.title': LEGAL_TITLE[data.documentType], 'document.type': data.documentType,
  }
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => vars[k] ?? '')
}

// ── Blocos ──

function Party({ b }: { b: Extract<Block, { type: 'party' }> }) {
  const { data } = useCtx()
  const p = b.role === 'issuer' ? data.org : data.customer
  const label = b.label ?? (b.role === 'issuer' ? 'Emitente' : 'Cliente')
  return (
    <Box style={b.style}>
      {label !== '' && <Box style={b.labelStyle ?? 'rotulo'}><Text>{label}</Text></Box>}
      <FiscalText style={b.nameStyle ?? { weight: 700 }} element="O nome">{p.name}</FiscalText>
      <FiscalText element="O NIF">{p.taxId ? `${b.taxIdLabel ?? 'NIF:'} ${p.taxId}` : 'Consumidor final'}</FiscalText>
      {p.addressLines?.map((l, i) => <Text key={i}>{l}</Text>)}
      {p.phone && <Text>{p.phone}</Text>}
      {p.email && <Text>{p.email}</Text>}
    </Box>
  )
}

type ItemColumn = NonNullable<Extract<Block, { type: 'items' }>['columns']>[number]
const DEFAULT_COLUMNS: ItemColumn[] = [
  { field: 'description', label: 'Descrição', flex: 4 },
  { field: 'quantity', label: 'Qtd.', flex: 0.8 },
  { field: 'unitPrice', label: 'Preço', flex: 1.6 },
  { field: 'taxRate', label: 'IVA', flex: 1.2 },
  { field: 'lineTotal', label: 'Total', flex: 1.6 },
]

function Items({ b }: { b: Extract<Block, { type: 'items' }> }) {
  const { data, t } = useCtx()
  const cols = b.columns ?? DEFAULT_COLUMNS
  const hasDetailsColumn = cols.some((c) => c.field === 'details')
  const sym = b.showCurrency !== false
  const cell = (field: string, l: DocumentData['lines'][number]): string => {
    switch (field) {
      case 'details': return l.details ?? ''
      case 'quantity': return String(l.quantity)
      case 'unitPrice': return money(l.unitPrice, data.currency, sym)
      case 'lineDiscount': return l.lineDiscount ? `${l.lineDiscount}%` : '-'
      case 'taxRate': return l.taxRate ? `${l.taxRate}%` : `Isento${l.taxExemptionCode ? ` (${l.taxExemptionCode})` : ''}`
      case 'taxAmount': return money(l.taxAmount, data.currency, sym)
      case 'lineTotal': return money(l.lineTotal, data.currency, sym)
      default: return l.description
    }
  }
  const align = (field: string) => (field === 'description' || field === 'details' ? 'left' : field === 'quantity' || field === 'taxRate' ? 'center' : 'right')
  // Grelha: linha à esquerda de cada coluna menos a primeira, e contorno da tabela.
  const grid = b.grid ? { width: b.grid.width, color: color(t, b.grid.color) ?? t.theme.colors.texto } : null
  // Com grelha, o espaço vai para dentro de cada célula (senão as linhas verticais encostavam ao texto).
  const cellExtra = (i: number, padY: number) => (grid
    ? { paddingVertical: padY, paddingHorizontal: 6, ...(i > 0 ? { borderLeftWidth: grid.width, borderLeftColor: grid.color } : {}) }
    : undefined)
  const zebra = color(t, b.zebra)
  return (
    <Box style={b.style} extra={grid ? { borderWidth: grid.width, borderColor: grid.color } : undefined}>
      <Box row style={b.headerStyle ?? 'cabecalhoTabela'} extra={grid ? { paddingVertical: 0, paddingHorizontal: 0 } : undefined}>
        {cols.map((c, i) => (
          <Box key={c.field} style={join({ flex: c.flex ?? 1, align: align(c.field) }, c.style)} extra={cellExtra(i, 6)}>
            <Text>{c.label ?? c.field}</Text>
          </Box>
        ))}
      </Box>
      {data.lines.map((l, li) => (
        <Box key={li} row style={b.rowStyle ?? 'linhaTabela'} extra={{ ...(grid ? { paddingVertical: 0, paddingHorizontal: 0 } : {}), ...(zebra && li % 2 === 1 ? { backgroundColor: zebra } : {}) }}>
          {cols.map((c, i) => (
            <Box key={c.field} style={join({ flex: c.flex ?? 1, align: align(c.field) }, c.style)} extra={cellExtra(i, 7)}>
              <FiscalText element="O texto das linhas da tabela">{cell(c.field, l)}</FiscalText>
              {c.field === 'description' && !hasDetailsColumn && l.details && <Box style={b.detailsStyle ?? 'detalhe'}><Text>{l.details}</Text></Box>}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

function Totals({ b }: { b: Extract<Block, { type: 'totals' }> }) {
  const { data, t } = useCtx()
  const tot = data.totals
  const m = (c: number) => money(c, data.currency, b.showCurrency !== false)
  const taxRows: [string, string][] = b.byRate === false
    ? [['Valor de impostos', m(tot.tax)]]
    : tot.byRate.map((r): [string, string] => [r.rate ? `IVA ${r.rate}% (base ${m(r.base)})` : `Isento (base ${m(r.base)})`, m(r.tax)])
  const rows: [string, string][] = [
    ['Totais sem impostos', m(tot.net)],
    ...taxRows,
    ['Valor de descontos', m(tot.discount)],
  ]
  const paid = data.status === 'paid' || data.documentType === 'FR'
  const rule = color(t, b.rowRule)
  const totalBg = color(t, b.totalBackground)
  return (
    <Box style={b.style}>
      {b.title && <Box style={b.titleStyle ?? 'rotulo'}><Text>{b.title}</Text></Box>}
      {rows.map(([k, v]) => (
        <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', ...(rule ? { paddingVertical: 6, borderBottomWidth: 0.4, borderBottomColor: rule } : { marginBottom: 6 }) }}>
          <FiscalText element="Os totais">{k}</FiscalText>
          <FiscalText element="Os totais">{v}</FiscalText>
        </View>
      ))}
      <Box style={totalBg ? { background: b.totalBackground } : undefined}
        extra={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: totalBg ? 8 : 0, marginTop: rule ? 0 : 4,
          ...(totalBg ? { marginHorizontal: -8, paddingHorizontal: 8 } : { borderTopWidth: 1, borderTopColor: color(t, b.ruleColor) ?? t.theme.colors.texto }) }}>
        <FiscalText element="O total" style={{ weight: 700 }}>{b.totalLabel ?? (paid ? 'TOTAL PAGO' : 'TOTAL A PAGAR')}</FiscalText>
        <FiscalText element="O total" style={b.totalStyle ?? { weight: 700, size: 16 }}>{m(tot.total)}</FiscalText>
      </Box>
    </Box>
  )
}

function Fiscal({ b }: { b: Extract<Block, { type: 'fiscal' }> }) {
  const { data } = useCtx()
  const parts = new Set<FiscalPart>(b.parts ?? FISCAL_PARTS)
  const exemptions = [...new Set(data.lines.filter((l) => !l.taxRate && l.taxExemptionCode).map((l) => l.taxExemptionCode))]
  return (
    <Box style={b.style}>
      {parts.has('atcud') && <FiscalText element="O ATCUD">ATCUD: {data.atcud}</FiscalText>}
      {parts.has('exemptions') && exemptions.length > 0 && <FiscalText element="As menções legais">Motivo de isenção: {exemptions.join(', ')}</FiscalText>}
      {parts.has('legal') && (
        <FiscalText element="As menções legais">
          Os bens e serviços foram colocados à disposição do adquirente em {data.org.city ?? 'Angola'}, na data {date(data.issuedAt)} às {time(data.issuedAt)}.
        </FiscalText>
      )}
      {parts.has('certification') && <FiscalText element="A menção do programa certificado">{data.hashChars}-Processado por programa válido nº {data.certificationNumber}</FiscalText>}
    </Box>
  )
}

/** Altura do QR da AGT com a margem branca e a legenda (pt). */
/**
 * Código QR da AGT: não é um bloco. É desenhado sempre no canto inferior direito da última
 * página, por cima da faixa do rodapé - posição exigida pela AGT, igual em todos os modelos.
 */
export const AGT_QR = { size: 96, caption: 'Verificar factura - AGT' } as const

const QR_TILE_H = AGT_QR.size + 12 + 9
/** O QR fica 8 pt acima da faixa do rodapé, e o conteúdo acaba pelo menos 6 pt acima do QR. */
const QR_ABOVE_FOOTER = 8
const QR_GAP = 6

/**
 * Código QR da AGT. Sem props de estilo nem de posição: é igual em todos os modelos.
 * Desenhado em vector, com tamanho fixo (não encolhe), sobre branco, com a legenda em cima
 * e a marca da AGT ao centro. Sem hooks - é desenhado dentro de um `render` do react-pdf.
 */
function AgtQr({ qr }: { qr: QrData }) {
  const size = AGT_QR.size
  const logo = Math.round(size * 0.24)
  // Caminho já em pontos (sem viewBox): dentro de um `render` do react-pdf a escala do
  // viewBox perde-se e cada módulo saía com 1 pt.
  const m = size / qr.n
  const d = qr.runs.map(([x, y, w]) => `M${(x * m).toFixed(3)} ${(y * m).toFixed(3)}h${(w * m).toFixed(3)}v${m.toFixed(3)}h-${(w * m).toFixed(3)}z`).join('')
  const fixed = { width: size, height: size, minWidth: size, minHeight: size, flexShrink: 0, flexGrow: 0 }
  const lp = (size - logo) / 2 - 2
  return (
    <View style={{ backgroundColor: '#FFFFFF', padding: 6, alignItems: 'center', width: size + 12 }}>
      <Text style={{ fontSize: 6, color: '#000000', marginBottom: 3, fontFamily: 'Helvetica' }}>{AGT_QR.caption}</Text>
      <View style={{ ...fixed, position: 'relative' }}>
        <Svg width={size} height={size} style={fixed}>
          <Path d={d} fill="#000000" />
        </Svg>
        <View style={{ position: 'absolute', top: lp, left: lp, width: logo + 4, height: logo + 4, backgroundColor: '#FFFFFF', padding: 2 }}>
          <Image src={AGT_LOGO_DATA_URL} style={{ width: logo, height: logo, objectFit: 'contain' }} />
        </View>
      </View>
    </View>
  )
}

/** Rótulo por cima (por omissão) ou ao lado do conteúdo (`inline`). */
function Labelled({ label, labelStyle, inline, style, children }: { label: string; labelStyle?: StyleRef; inline?: boolean; style?: StyleRef; children: ReactNode }) {
  if (label === '') return <Box style={style}>{children}</Box>
  return (
    <Box row={inline} style={style}>
      <Box style={join(labelStyle ?? 'rotulo', inline ? { marginBottom: 0 } : undefined)} extra={inline ? { width: 80 } : undefined}><Text>{label}</Text></Box>
      <View style={inline ? { flex: 1 } : {}}>{children}</View>
    </Box>
  )
}

function Bank({ b }: { b: Extract<Block, { type: 'bank' }> }) {
  const { data, t } = useCtx()
  const accounts = data.org.bankAccounts ?? []
  if (!accounts.length) return null
  const label = b.label ?? 'Dados bancários'
  if (b.layout !== 'table') {
    return (
      <Labelled label={label} labelStyle={b.labelStyle} style={b.style}>
        {accounts.map((a, i) => (
          <View key={i} style={{ marginBottom: 3 }}>
            <Text style={{ fontWeight: 700 }}>{a.bank}{a.holder ? ` · ${a.holder}` : ''}</Text>
            <Text>IBAN {a.iban}</Text>
          </View>
        ))}
      </Labelled>
    )
  }
  const grid = b.grid ? { width: b.grid.width, color: color(t, b.grid.color) ?? t.theme.colors.texto } : null
  const cols: [string, number, (a: (typeof accounts)[number]) => string][] = [
    ['Banco', 1.2, (a) => a.bank], ['IBAN', 2.4, (a) => a.iban], ['Titular', 2, (a) => a.holder ?? data.org.name],
  ]
  const cellExtra = (i: number) => ({ paddingVertical: 6, paddingHorizontal: 6, ...(grid && i > 0 ? { borderLeftWidth: grid.width, borderLeftColor: grid.color } : {}) })
  return (
    <Box style={b.style}>
      {label !== '' && <Box style={b.labelStyle ?? 'rotulo'}><Text>{label}</Text></Box>}
      <View style={grid ? { borderWidth: grid.width, borderColor: grid.color } : {}}>
        <Box row style={b.headerStyle ?? 'cabecalhoTabela'} extra={{ paddingVertical: 0, paddingHorizontal: 0 }}>
          {cols.map(([h, f], i) => <Box key={h} style={{ flex: f }} extra={cellExtra(i)}><Text>{h.toUpperCase()}</Text></Box>)}
        </Box>
        {accounts.map((a, r) => (
          <View key={r} style={{ flexDirection: 'row', ...(grid ? { borderTopWidth: grid.width, borderTopColor: grid.color } : {}) }}>
            {cols.map(([h, f, get], i) => <View key={h} style={{ flex: f, ...cellExtra(i) }}><Text style={h === 'IBAN' ? { fontWeight: 700 } : {}}>{get(a)}</Text></View>)}
          </View>
        ))}
      </View>
    </Box>
  )
}

/** Faixas decorativas no canto superior direito (as do modelo clássico do Vero). */
function Corner({ hex }: { hex: string | null }) {
  const mix = (h: string, ratio: number) => {
    const n = parseInt(h.slice(1), 16)
    const c = (v: number) => Math.round(v + (255 - v) * ratio).toString(16).padStart(2, '0')
    return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`
  }
  const [c1, c2, c3] = hex ? [mix(hex, 0.62), mix(hex, 0.4), mix(hex, 0.15)] : ['#e5e7eb', '#d1d5db', '#9ca3af']
  return (
    <Svg width={190} height={95} style={{ position: 'absolute', top: 0, right: 0 }}>
      <Polygon points="0,0 190,0 190,28 90,28" fill={c1} />
      <Polygon points="65,0 190,0 190,68 140,68" fill={c2} />
      <Polygon points="125,0 190,0 190,95" fill={c3} />
    </Svg>
  )
}

type At = NonNullable<RenderWarning['at']>
const child = (at: At, i: number): At => ({ zone: at.zone, path: [...at.path, i] })

/** Bloco com a sua posição no contexto, para os avisos dizerem onde está. */
function Node({ b, at }: { b: Block; at: At }) {
  const ctx = useCtx()
  return <RenderCtx.Provider value={{ ...ctx, at }}><BlockView b={b} at={at} /></RenderCtx.Provider>
}

function BlockView({ b, at }: { b: Block; at: At }) {
  const ctx = useCtx()
  const { data, t } = ctx
  switch (b.type) {
    case 'row': return <Box row style={b.style}>{b.children.map((c, i) => <Node key={i} b={c} at={child(at, i)} />)}</Box>
    case 'stack': return <Box style={b.style}>{b.children.map((c, i) => <Node key={i} b={c} at={child(at, i)} />)}</Box>
    case 'text': return <Box style={b.style}><Text>{interpolate(b.text, data)}</Text></Box>
    case 'spacer': return <View style={{ height: b.size }} />
    case 'divider': return <View style={{ borderTopWidth: b.width ?? 0.5, borderTopColor: color(t, b.color) ?? t.theme.colors.texto }} />
    case 'logo':
      return (
        <Box style={b.style}>
          {data.org.logoUrl
            ? <Image src={data.org.logoUrl} style={{ height: b.height ?? 40, objectFit: 'contain' }} />
            : b.fallback === 'none' ? null : <Box style={b.fallbackStyle}><Text>{data.org.name}</Text></Box>}
        </Box>
      )
    case 'documentTitle': return <FiscalText style={b.style} element="O tipo do documento">{LEGAL_TITLE[data.documentType]}{b.withCode ? ` - ${data.documentType}` : ''}</FiscalText>
    case 'documentNumber': return <FiscalText style={b.style} element="O número do documento">{b.prefix ? `${interpolate(b.prefix, data)} ` : ''}{data.number}</FiscalText>
    case 'documentDate': return <FiscalText style={b.style} element="A data de emissão">{b.prefix ? `${b.prefix} ` : ''}{date(data.issuedAt)}{b.withTime === false ? '' : ` ${time(data.issuedAt)}`}</FiscalText>
    case 'atcud': return <FiscalText style={b.style} element="O ATCUD">{b.prefix ?? 'ATCUD:'} {data.atcud}</FiscalText>
    case 'statusBadge': {
      if (!data.status) return null
      return <Box style={b.style}><Text>{STATUS_TEXT[data.status]}</Text></Box>
    }
    case 'party': return <Party b={b} />
    case 'payment':
      if (!data.payment) return null
      return (
        <Box style={b.style}>
          {b.label !== '' && <Box style={b.labelStyle ?? 'rotulo'}><Text>{b.label ?? 'Pagamento'}</Text></Box>}
          <Text style={{ fontWeight: 700 }}>Método: {data.payment.method}</Text>
          {data.payment.reference && <Text>Referência: {data.payment.reference}</Text>}
          {data.payment.date && <Text>Data: {date(data.payment.date)}</Text>}
        </Box>
      )
    case 'items': return <Items b={b} />
    case 'totals': return <Totals b={b} />
    case 'notes':
      if (!data.notes) return null
      return <Labelled label={b.label ?? ''} labelStyle={b.labelStyle} inline={b.inline} style={b.style}><Text>{data.notes}</Text></Labelled>
    case 'fiscal': return <Fiscal b={b} />
    case 'amountInWords':
      if (!data.amountInWords) return null
      return <Labelled label={b.label ?? 'Por extenso'} labelStyle={b.labelStyle} inline={b.inline} style={b.style}><Text>{data.amountInWords}</Text></Labelled>
    case 'bank': return <Bank b={b} />
    case 'pageNumber':
      return <Box style={b.style}><Text render={({ pageNumber, totalPages }) => `PÁGINA ${pageNumber} / ${totalPages}`} /></Box>
  }
}

// ── Letras ──

let fontsReady = false

/**
 * As letras vêm dentro do pacote (pasta fonts/, licença OFL). O caminho resolve-se a partir
 * deste ficheiro, no Node (caminho de disco) e nos bundlers (URL do recurso).
 */
function fontSrc(file: string): string {
  const url = new URL(`../../fonts/${file}`, import.meta.url)
  if (url.protocol !== 'file:') return url.href
  const path = decodeURIComponent(url.pathname)
  return /^\/[A-Za-z]:\//.test(path) ? path.slice(1) : path // Windows: /C:/... → C:/...
}

/** Regista as letras uma vez. Chamado automaticamente pelo render; exportado para quem desenha com o react-pdf directamente. */
export function registerFonts(resolve: (file: string) => string = fontSrc) {
  if (fontsReady) return
  Font.register({ family: 'Inter', fonts: [400, 600, 700].map((w) => ({ src: resolve(`inter-${w}.woff`), fontWeight: w })) })
  Font.register({ family: 'Playfair Display', fonts: [400, 700].map((w) => ({ src: resolve(`playfair-display-${w}.woff`), fontWeight: w })) })
  Font.registerHyphenationCallback((word) => [word])
  fontsReady = true
}

// ── Documento ──

// O QR só depende do URL - no editor redesenha-se a cada tecla, não vale a pena refazê-lo.
// Desenha-se em vector (módulos como rectângulos): nítido a qualquer tamanho e na impressão.
const qrCache = new Map<string, QrData>()
function qrFor(url: string): QrData {
  let q = qrCache.get(url)
  if (!q) {
    const { modules } = QRCode.create(url, { errorCorrectionLevel: 'M' })
    const n = modules.size
    const runs: [number, number, number][] = []
    for (let y = 0; y < n; y++) {
      // Módulos escuros seguidos na mesma linha viram um só rectângulo.
      for (let x = 0; x < n; x++) {
        if (!modules.get(y, x)) continue
        let run = 1
        while (x + run < n && modules.get(y, x + run)) run++
        runs.push([x, y, run])
        x += run - 1
      }
    }
    q = { n, runs }
    qrCache.set(url, q)
    if (qrCache.size > 20) qrCache.delete(qrCache.keys().next().value!)
  }
  return q
}

/**
 * Altura aproximada (pt) de que um bloco precisa. Serve para a faixa do rodapé nunca ficar
 * mais baixa do que o conteúdo - senão o motor apertava o que lá está (o QR ficava achatado).
 */
function estimateHeight(t: TemplateV2, b: Block, inheritedSize = 9): number {
  const s = merge(t, b.style)
  const fs = s.size ?? inheritedSize
  const line = fs * (s.lineHeight ?? 1.3)
  const pad = 2 * (s.paddingY ?? s.padding ?? 0) + (s.marginTop ?? 0) + (s.marginBottom ?? 0)
    + (s.borderTop?.width ?? 0) + (s.borderBottom?.width ?? 0) + 2 * (s.border?.width ?? 0)
  switch (b.type) {
    case 'row': return Math.max(0, ...b.children.map((c) => estimateHeight(t, c, fs))) + pad
    case 'stack': return b.children.reduce((h, c) => h + estimateHeight(t, c, fs), 0) + (s.gap ?? 0) * Math.max(0, b.children.length - 1) + pad
    case 'fiscal': return line * (b.parts ?? FISCAL_PARTS).length * 1.5 + pad
    case 'spacer': return b.size
    case 'logo': return (b.height ?? 40) + pad
    default: return line + pad
  }
}

export interface RenderV2Result { document: ReactNode; warnings: RenderWarning[] }

/**
 * `insertMissing: false` só no editor: mostra o modelo tal como está (ex.: em branco) e
 * os elementos obrigatórios em falta vêm como avisos. Um documento emitido usa sempre o
 * valor por omissão (true) - nunca sai sem eles.
 */
export async function buildDocumentV2(input: TemplateV2, data: DocumentData, opts: { insertMissing?: boolean } = {}): Promise<RenderV2Result> {
  registerFonts()
  const { template: t, warnings } = ensureFiscalBlocks(input, { insert: opts.insertMissing })
  const qr = qrFor(data.qrUrl)
  const pageBg = color(t, t.page?.background ?? 'fundo') ?? '#FFFFFF'
  const marginX = t.page?.marginX ?? 48
  let bottomH = t.bottom ? t.bottom.height ?? 60 : 0
  if (t.bottom) {
    const zs = merge(t, t.bottom.style)
    const need = Math.ceil(estimateHeight(t, { type: 'stack', children: t.bottom.children, style: zs } as Block))
    if (need > bottomH) {
      warnings.push({ kind: 'space', element: 'A faixa do rodapé',
        message: `A faixa do rodapé tem ${bottomH} pt, mas o que lá está precisa de cerca de ${need} pt. No PDF o Vero já a aumentou, para nada ficar apertado - guarde a altura certa no modelo.`,
        fix: { label: `Mudar para ${need} pt`, bottomHeight: need } })
      bottomH = need
    }
  }
  const merged = new Map<string, RenderWarning & { elements: string[] }>()
  const ctx: Ctx = { t, data, qr, bg: pageBg, fg: t.theme.colors.texto, warn: (w) => {
    // O mesmo problema no mesmo bloco (ex.: nome e NIF de uma parte) é um só aviso.
    const key = `${w.kind}|${JSON.stringify(w.at)}|${w.colors?.chosen}|${w.colors?.background}`
    let entry = merged.get(key)
    if (!entry) {
      entry = { ...w, elements: [] }
      merged.set(key, entry)
      warnings.push(entry)
    }
    if (!entry.elements.includes(w.element)) entry.elements.push(w.element)
    entry.element = entry.elements[0]
    entry.message = warningMessage(t, entry)
  } }
  const base = merge(t, 'body')

  const document = (
    <RenderCtx.Provider value={ctx}>
      <Document title={`${LEGAL_TITLE[data.documentType]} ${data.number}`} creator="Vero" producer="Vero">
        <Page size="A4" style={{ backgroundColor: pageBg, paddingBottom: bottomH + 24, fontFamily: t.theme.fonts?.body ?? 'Helvetica', fontSize: 9, color: t.theme.colors.texto, ...pdfStyle(t, base) }}>
          {t.page?.corner && <Corner hex={t.page.cornerColor ? color(t, t.page.cornerColor) ?? null : null} />}
          {t.top && <Box style={t.top.style}>{t.top.children.map((c, i) => <Node key={i} b={c} at={{ zone: 'top', path: [i] }} />)}</Box>}
          <View style={{ paddingHorizontal: marginX, marginTop: t.page?.marginTop ?? 28 }}>
            {t.body.map((c, i) => <Node key={i} b={c} at={{ zone: 'body', path: [i] }} />)}
            {/* Espaço do QR no fim do corpo: se o conteúdo lhe fosse tocar, o QR passa para uma página nova. */}
            <View wrap={false} style={{ height: QR_TILE_H + QR_GAP - (24 - QR_ABOVE_FOOTER) }} />
          </View>
          {/* QR da AGT: canto inferior direito, só na última página. */}
          <View fixed style={{ position: 'absolute', right: marginX, bottom: bottomH + QR_ABOVE_FOOTER }}
            // O react-pdf passa totalPages a todos os `render` (os tipos só o declaram no Text).
            render={(({ pageNumber, totalPages }: { pageNumber: number; totalPages?: number }) => (pageNumber === totalPages ? <AgtQr qr={qr} /> : null)) as never} />
          {t.bottom && (
            <Box fixed style={t.bottom.style} extra={{ position: 'absolute', bottom: 0, left: 0, width: PAGE_W, height: bottomH }}>
              {t.bottom.children.map((c, i) => <Node key={i} b={c} at={{ zone: 'bottom', path: [i] }} />)}
            </Box>
          )}
        </Page>
      </Document>
    </RenderCtx.Provider>
  )
  return { document, warnings }
}
