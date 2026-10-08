/**
 * Componentes do @veroao/invoice. Não desenham nada sozinhos: marcam o que cada
 * peça é, e o `compile()` transforma a árvore React no modelo (JSON) que o
 * renderizador desenha. Os dados (linhas, NIF, totais, ATCUD, certificação, QR)
 * vêm sempre do documento - os componentes só definem o aspecto.
 */
import type { ReactNode } from 'react'
import type { TailwindConfig } from '../tailwind/tailwind.js'
import type { FiscalPart } from '../core/types.js'

/** Estilos em objecto (pt), como no react-pdf - alternativa ao className. */
export interface PdfStyle {
  color?: string
  backgroundColor?: string
  fontSize?: number
  fontWeight?: number | 'normal' | 'bold'
  fontFamily?: 'body' | 'display'
  textAlign?: 'left' | 'center' | 'right'
  textTransform?: 'uppercase' | 'none'
  letterSpacing?: number
  lineHeight?: number
  padding?: number
  paddingHorizontal?: number
  paddingVertical?: number
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
  margin?: number
  marginHorizontal?: number
  marginVertical?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number | 'auto'
  marginRight?: number | 'auto'
  gap?: number
  flex?: number
  width?: number | `${number}%`
  height?: number
  borderRadius?: number
  borderWidth?: number
  borderColor?: string
  borderTopWidth?: number
  borderTopColor?: string
  borderBottomWidth?: number
  borderBottomColor?: string
  borderLeftWidth?: number
  borderLeftColor?: string
  alignItems?: 'flex-start' | 'center' | 'flex-end'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between'
}

export interface Styled { className?: string; style?: PdfStyle }
type WithChildren = { children?: ReactNode }

export const VERO_KIND = Symbol.for('veroao.invoice.kind')

function marker<P>(kind: string, displayName: string) {
  const C = (_props: P): null => null
  ;(C as unknown as Record<symbol, string>)[VERO_KIND] = kind
  C.displayName = displayName
  return C
}

// ── Estrutura ────────────────────────────────────────────────────────────────

/** Cores e letras do modelo, como o `tailwind.config` (theme.extend.colors / fontFamily). */
export const Tailwind = marker<{ config?: TailwindConfig } & WithChildren>('tailwind', 'Tailwind')
/** A página A4. bg-* = fundo, px-* = margens laterais, pt-* = margem acima do corpo. */
export const Document = marker<Styled & WithChildren>('document', 'Document')
/** Faixa a toda a largura no topo da 1.ª página. */
export const Header = marker<Styled & WithChildren>('header', 'Header')
/** Faixa a toda a largura no fundo de todas as páginas (h-* = altura). */
export const Footer = marker<Styled & WithChildren>('footer', 'Footer')
/** Faixas decorativas no canto superior direito. */
export const CornerDecoration = marker<{ color?: string }>('corner', 'CornerDecoration')
/** Blocos lado a lado. */
export const Row = marker<Styled & WithChildren>('row', 'Row')
/** Blocos empilhados. */
export const Column = marker<Styled & WithChildren>('stack', 'Column')
/** Texto livre. Aceita {{org.name}}, {{org.website}}, {{customer.name}}, {{document.reference}}, {{document.number}}. */
export const Text = marker<Styled & { children?: ReactNode }>('text', 'Text')
/** Espaço vertical (h-*). */
export const Spacer = marker<Styled>('spacer', 'Spacer')
/** Linha horizontal (border-t-*). */
export const Hr = marker<Styled>('divider', 'Hr')
/** Logótipo da empresa; sem imagem mostra o nome (ou nada, com fallback="none"). */
export const Logo = marker<Styled & { fallback?: 'name' | 'none'; fallbackClassName?: string }>('logo', 'Logo')

// ── Documento (fiscais: podem mudar de aspecto e de lugar, nunca faltar) ──────

/** Factura, Factura-Recibo, Nota de Crédito… (texto legal). */
export const DocumentTitle = marker<Styled & { withCode?: boolean }>('documentTitle', 'DocumentTitle')
/** Série e número. `prefix` aceita {{document.title}} e {{document.type}}. */
export const DocumentNumber = marker<Styled & { prefix?: string }>('documentNumber', 'DocumentNumber')
export const DocumentDate = marker<Styled & { prefix?: string; withTime?: boolean }>('documentDate', 'DocumentDate')
export const Atcud = marker<Styled & { prefix?: string }>('atcud', 'Atcud')
/** PAGO / POR PAGAR / ANULADO. */
export const StatusBadge = marker<Styled>('statusBadge', 'StatusBadge')

type PartyProps = Styled & { label?: string; taxIdLabel?: string; labelClassName?: string; nameClassName?: string }
/** A empresa que emite. */
export const Issuer = marker<PartyProps>('party:issuer', 'Issuer')
/** O cliente. */
export const Customer = marker<PartyProps>('party:customer', 'Customer')
export const Payment = marker<Styled & { label?: string; labelClassName?: string }>('payment', 'Payment')

export type ItemField = 'description' | 'details' | 'quantity' | 'unitPrice' | 'lineDiscount' | 'taxRate' | 'taxAmount' | 'lineTotal'
export interface ItemColumn { field: ItemField; label?: string; width?: number; className?: string }
/** Tabela das linhas. `rowClassName` aceita even:bg-* (linhas alternadas). */
export const Items = marker<Styled & {
  columns?: ItemColumn[]
  headerClassName?: string
  rowClassName?: string
  detailsClassName?: string
  /** Linhas entre colunas e à volta da tabela, ex.: "border border-zinc-300". */
  gridClassName?: string
  showCurrency?: boolean
}>('items', 'Items')

export const Totals = marker<Styled & {
  title?: string
  totalLabel?: string
  /** false = uma só linha "Valor de impostos". */
  byRate?: boolean
  showCurrency?: boolean
  titleClassName?: string
  totalClassName?: string
  /** Cor do filete antes do total, ex.: "border-zinc-900". */
  ruleClassName?: string
  /** Linha entre valores, ex.: "border-b border-zinc-200". */
  rowClassName?: string
  /** Fundo da linha do total. */
  totalRowClassName?: string
}>('totals', 'Totals')

type LabelledProps = Styled & { label?: string; inline?: boolean; labelClassName?: string }
export const Notes = marker<LabelledProps>('notes', 'Notes')
export const AmountInWords = marker<LabelledProps>('amountInWords', 'AmountInWords')
export const BankAccounts = marker<Styled & { label?: string; layout?: 'list' | 'table'; labelClassName?: string; headerClassName?: string; gridClassName?: string }>('bank', 'BankAccounts')
/** ATCUD, isenções, texto legal e programa certificado (por omissão, todas). */
export const LegalNotes = marker<Styled & { parts?: FiscalPart[] }>('fiscal', 'LegalNotes')
/** PÁGINA 1 / 2 */
export const PageNumber = marker<Styled>('pageNumber', 'PageNumber')
