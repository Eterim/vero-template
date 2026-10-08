/**
 * Contrato v2 (prova de conceito): o modelo é uma árvore de blocos com estilos.
 * Continua a ser só dados - o Vero é que desenha. Os blocos fiscais podem ser
 * movidos e estilizados, nunca escondidos (ver fiscal.ts).
 */

/** Cor: nome de uma cor do tema ("destaque") ou hex ("#C9A227"). */
export type ColorRef = string

export interface Border { width: number; color: ColorRef }

export interface Style {
  background?: ColorRef
  color?: ColorRef
  font?: 'body' | 'display'
  size?: number
  weight?: 400 | 600 | 700
  letterSpacing?: number
  uppercase?: boolean
  lineHeight?: number
  align?: 'left' | 'center' | 'right'
  padding?: number
  paddingX?: number
  paddingY?: number
  marginTop?: number
  marginBottom?: number
  gap?: number
  radius?: number
  border?: Border
  borderTop?: Border
  borderBottom?: Border
  borderLeft?: Border
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  marginLeft?: number | 'auto'
  marginRight?: number | 'auto'
  /** Largura em pt ou em percentagem ("50%"). */
  width?: number | `${number}%`
  height?: number
  minHeight?: number
  borderRight?: Border
  /** Peso na linha (row): 1, 2... */
  flex?: number
  alignItems?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'between'
}

/** Estilo directo ou nome de um estilo do tema ("label"), ou lista para combinar. */
export type StyleRef = Style | string | (Style | string)[]

interface Base { style?: StyleRef }

export type Block =
  | (Base & { type: 'row'; children: Block[] })
  | (Base & { type: 'stack'; children: Block[] })
  | (Base & { type: 'text'; text: string })
  | (Base & { type: 'spacer'; size: number })
  | (Base & { type: 'divider'; color?: ColorRef; width?: number })
  | (Base & { type: 'logo'; height?: number; fallbackStyle?: StyleRef; /** Sem imagem: mostrar o nome da empresa (omissão) ou nada. */ fallback?: 'name' | 'none' })
  | (Base & { type: 'documentTitle'; /** Acrescenta " - FR" */ withCode?: boolean })
  | (Base & { type: 'documentNumber'; /** Texto antes do número; aceita {{document.title}} e {{document.type}} */ prefix?: string })
  | (Base & { type: 'documentDate'; prefix?: string; withTime?: boolean })
  | (Base & { type: 'atcud'; prefix?: string })
  | (Base & { type: 'statusBadge' })
  | (Base & { type: 'party'; role: 'issuer' | 'customer'; label?: string; labelStyle?: StyleRef; nameStyle?: StyleRef; taxIdLabel?: string })
  | (Base & { type: 'payment'; label?: string; labelStyle?: StyleRef })
  | (Base & {
      type: 'items'
      headerStyle?: StyleRef
      rowStyle?: StyleRef
      detailsStyle?: StyleRef
      /** Fundo das linhas pares (linhas alternadas). */
      zebra?: ColorRef
      /** Linhas entre colunas e à volta da tabela. */
      grid?: Border
      /** false = valores sem "Kz" (quando o documento já diz "valores em kwanzas"). */
      showCurrency?: boolean
      columns?: { field: 'description' | 'details' | 'quantity' | 'unitPrice' | 'lineDiscount' | 'taxRate' | 'taxAmount' | 'lineTotal'; label?: string; flex?: number; style?: StyleRef }[]
    })
  | (Base & {
      type: 'totals'; title?: string; titleStyle?: StyleRef; totalStyle?: StyleRef; ruleColor?: ColorRef
      /** false = uma só linha "Valor de impostos" em vez de uma por taxa. */
      byRate?: boolean
      totalLabel?: string
      /** Linha entre as linhas dos totais. */
      rowRule?: ColorRef
      /** Fundo da linha do total. */
      totalBackground?: ColorRef
      showCurrency?: boolean
    })
  | (Base & { type: 'notes'; label?: string; labelStyle?: StyleRef; inline?: boolean })
  | (Base & { type: 'fiscal'; /** Que menções este bloco mostra (por omissão, todas). */ parts?: FiscalPart[] })
  | (Base & { type: 'pageNumber' })
  | (Base & { type: 'amountInWords'; label?: string; labelStyle?: StyleRef; inline?: boolean })
  | (Base & { type: 'bank'; label?: string; labelStyle?: StyleRef; layout?: 'list' | 'table'; headerStyle?: StyleRef; grid?: Border })

export type BlockType = Block['type']

export const FISCAL_PARTS = ['atcud', 'exemptions', 'legal', 'certification'] as const
export type FiscalPart = (typeof FISCAL_PARTS)[number]

export interface TemplateV2 {
  version: 2
  theme: {
    /** `fundo` (página) e `texto` (texto principal) existem sempre; o resto tem os nomes que quiser. */
    colors: Record<string, string> & { fundo: string; texto: string }
    fonts?: { body?: FontFamily; display?: FontFamily }
    styles?: Record<string, Style>
  }
  page?: { background?: ColorRef; marginX?: number; marginTop?: number; /** Faixas decorativas no canto superior direito. */ corner?: boolean; cornerColor?: ColorRef }
  /** Faixa do topo (a toda a largura, só na 1.ª página). */
  top?: Base & { children: Block[] }
  /** Faixa do fundo (a toda a largura, em todas as páginas). */
  bottom?: Base & { children: Block[]; height?: number }
  body: Block[]
}

export const FONT_FAMILIES = ['Inter', 'Playfair Display', 'Helvetica', 'Times-Roman'] as const
export type FontFamily = (typeof FONT_FAMILIES)[number]

// ── Dados do documento (vêm do Vero, já calculados e assinados) ─────────────

export interface DocumentParty {
  name: string
  taxId?: string | null
  addressLines?: string[]
  email?: string | null
  phone?: string | null
}

export interface DocumentLine {
  description: string
  details?: string | null
  quantity: number
  unitPrice: number // cêntimos
  lineDiscount?: number // %
  taxRate: number
  taxExemptionCode?: string | null
  taxAmount: number // cêntimos
  lineTotal: number // cêntimos, sem IVA
}

export interface DocumentData {
  documentType: 'FT' | 'FR' | 'NC' | 'ND' | 'RC'
  number: string
  issuedAt: Date
  atcud: string
  /** 4 caracteres da assinatura, para o rodapé AGT. */
  hashChars: string
  certificationNumber: string
  qrUrl: string
  status?: 'paid' | 'pending' | 'cancelled'
  reference?: string | null
  org: DocumentParty & { logoUrl?: string | null; website?: string | null; city?: string | null; bankAccounts?: { bank: string; iban: string; holder?: string | null }[] }
  customer: DocumentParty
  payment?: { method: string; reference?: string | null; date?: Date | null }
  lines: DocumentLine[]
  totals: { net: number; tax: number; discount: number; total: number; byRate: { rate: number; base: number; tax: number }[] }
  notes?: string | null
  /** Total por extenso, escrito pelo Vero. */
  amountInWords?: string | null
  currency: string
}

/** Aviso do renderizador, em linguagem simples, com o que o editor precisa para o mostrar. */
export interface RenderWarning {
  kind: 'contrast' | 'minSize' | 'missing' | 'duplicate' | 'space'
  /** "O NIF", "Os totais"... (o primeiro, se forem vários) */
  element: string
  /** Todos os elementos do bloco com o mesmo problema. */
  elements?: string[]
  /** Frase pronta a mostrar. */
  message: string
  /** Onde está o bloco (para o editor o seleccionar). */
  at?: { zone: 'top' | 'body' | 'bottom'; path: number[] }
  /** Correcção que o editor pode aplicar com um clique. */
  fix?: { label: string; bottomHeight?: number; /** Bloco a acrescentar (elementos obrigatórios em falta). */ addBlock?: Block; /** No início do corpo (senão no fim). */ atStart?: boolean }
  /** Só em 'contrast': a cor escolhida, o fundo e a cor que o Vero usou (hex). */
  colors?: { chosen: string; background: string; used: string }
}
