/**
 * Verificação de segurança de um template em JSON, antes de o aceitar (pull request na
 * galeria, importação no Vero). Um template é usado por empresas que não o escreveram:
 * nada nele pode parecer dado fiscal ou de pagamento que não venha do documento.
 *
 * - Textos livres: sem IBAN, contas, telefones, NIF ou outros números longos, ligações,
 *   e-mails, caracteres invisíveis, nem frases que imitem as menções fiscais.
 * - Variáveis ({{...}}) só da lista conhecida.
 * - Restantes valores (cores, nomes, tipos): só formas simples, sem texto arbitrário.
 * - Limites de tamanho, profundidade e número de blocos.
 */
import { FONT_FAMILIES } from './types.js'

export interface SafetyIssue {
  /** Onde está o problema, ex.: body[2].children[0].text */
  path: string
  message: string
}

/** Variáveis que um texto pode usar - vêm sempre dos dados do documento, nunca do template. */
export const TEMPLATE_VARIABLES = [
  'org.name', 'org.website', 'org.email', 'org.phone', 'customer.name',
  'document.reference', 'document.number', 'document.title', 'document.type',
] as const

const BLOCK_TYPES = new Set([
  'row', 'stack', 'text', 'spacer', 'divider', 'logo', 'documentTitle', 'documentNumber', 'documentDate', 'atcud',
  'statusBadge', 'party', 'payment', 'items', 'totals', 'notes', 'fiscal', 'pageNumber', 'amountInWords', 'bank',
])

/** Chaves com texto que aparece no PDF, e o tamanho máximo de cada uma. */
const FREE_TEXT: Record<string, number> = { text: 200, prefix: 60, label: 60, taxIdLabel: 40, title: 60, totalLabel: 60 }

export const LIMITS = { jsonBytes: 200_000, blocks: 400, depth: 16 }

/** Valores que não são texto livre: cores, nomes do tema, tipos, letras, larguras. */
const SIMPLE_VALUE = /^[A-Za-z0-9#%._ -]{1,48}$/
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
const NAME = /^[A-Za-z][A-Za-z0-9_-]{0,31}$/

const INVISIBLE = /[\u0000-\u001F\u007F-\u009F­​-‏‪-‮⁠-⁤⁦-⁩﻿]/
const URL_LIKE = /(?:[a-z][a-z0-9+.-]*:\/\/|www\.|\b[a-z0-9-]+\.(?:ao|com|net|org|io|co|me|app|pt|br|info|biz|xyz|link|ly)\b)/i
const EMAIL_LIKE = /[^\s@]+@[^\s@]+/
const IBAN_LIKE = /\b[A-Z]{2}\s?\d{2}(?:[\s.-]?[0-9A-Z]{4}){2,}/i
/** 6 ou mais algarismos seguidos (com espaços, pontos ou traços pelo meio): contas, telefones, NIF, referências. */
const LONG_NUMBER = /\d(?:[\s.\-/]?\d){5,}/

/**
 * Frases que só os componentes fiscais podem escrever. Cada regra lista as chaves onde a
 * palavra é legítima (ex.: "ATCUD" como prefixo do <Atcud />, "Contribuinte" como rótulo do NIF).
 */
const RESERVED: { re: RegExp; what: string; allowedIn?: string[] }[] = [
  { re: /certifica/i, what: 'a menção do programa certificado' },
  { re: /processad[oa]\s+por/i, what: 'a menção do programa certificado' },
  { re: /\bprograma\b|\bsoftware\b/i, what: 'a menção do programa certificado' },
  { re: /\bAGT\b|administra[cç][aã]o\s+geral\s+tribut/i, what: 'referências à AGT' },
  { re: /\bATCUD\b|c[oó]digo\s+[uú]nico/i, what: 'o ATCUD', allowedIn: ['atcud.prefix'] },
  { re: /\bhash\b|assinatura/i, what: 'a assinatura do documento' },
  { re: /\bNIF\b|contribuinte/i, what: 'o NIF', allowedIn: ['party.taxIdLabel', 'party.label'] },
  { re: /\boriginal\b|duplicado|triplicado|segunda\s+via|2\.?\s*ª\s*via/i, what: 'a indicação de via do documento' },
  { re: /\bIBAN\b|\bNIB\b|\bSWIFT\b|\bBIC\b|refer[eê]ncia\s+(?:de\s+)?pagamento|multicaixa|express\b/i, what: 'dados de pagamento (vêm da empresa, em <BankAccounts />)', allowedIn: ['bank.label', 'payment.label'] },
  { re: /\bisent[oa]\b|\bisen[cç][aã]o\b|regime\s+(?:de\s+)?(?:iva|exclus|simplific|geral)|artigo\s+\d|\bart\.?\s*\d/i, what: 'motivos de isenção ou textos legais (vêm de <LegalNotes />)' },
  { re: /\banulad[oa]\b|\bpago\b|\bliquidad[oa]\b/i, what: 'o estado do documento (vem de <StatusBadge />)' },
]

export function checkTemplate(input: unknown): SafetyIssue[] {
  const issues: SafetyIssue[] = []
  const add = (path: string, message: string) => issues.push({ path, message })

  let size = 0
  try { size = new TextEncoder().encode(JSON.stringify(input)).length } catch { add('', 'o template não é JSON válido'); return issues }
  if (size > LIMITS.jsonBytes) add('', `o template tem ${Math.round(size / 1000)} kB - o máximo é ${LIMITS.jsonBytes / 1000} kB`)

  if (!isObject(input) || input.version !== 2 || !Array.isArray(input.body)) {
    add('', 'formato desconhecido: esperado um template v2 ({ version: 2, theme, body: [...] })')
    return issues
  }

  // Tema: nomes simples e cores em hex.
  const theme = input.theme
  if (!isObject(theme) || !isObject(theme.colors)) add('theme', 'o tema tem de ter cores (background e foreground)')
  else {
    for (const [k, v] of Object.entries(theme.colors)) {
      if (!NAME.test(k)) add(`theme.colors.${k}`, 'nome de cor inválido - letras, números, - e _')
      if (typeof v !== 'string' || !HEX.test(v)) add(`theme.colors.${k}`, 'a cor tem de ser hex (#RRGGBB)')
    }
    if (isObject(theme.fonts)) {
      for (const [k, v] of Object.entries(theme.fonts)) {
        if (!(FONT_FAMILIES as readonly unknown[]).includes(v)) add(`theme.fonts.${k}`, `letra desconhecida - use ${FONT_FAMILIES.join(', ')}`)
      }
    }
    if (isObject(theme.styles)) for (const k of Object.keys(theme.styles)) if (!NAME.test(k)) add(`theme.styles.${k}`, 'nome de estilo inválido')
  }

  let blocks = 0
  const visitBlock = (b: unknown, path: string, depth: number) => {
    if (depth > LIMITS.depth) { add(path, `blocos dentro de blocos a mais (máximo ${LIMITS.depth} níveis)`); return }
    if (++blocks === LIMITS.blocks + 1) add(path, `blocos a mais (máximo ${LIMITS.blocks})`)
    if (!isObject(b) || typeof b.type !== 'string' || !BLOCK_TYPES.has(b.type)) { add(path, 'bloco desconhecido'); return }
    if ('children' in b) {
      if (!Array.isArray(b.children)) add(`${path}.children`, 'children tem de ser uma lista')
      else b.children.forEach((c, i) => visitBlock(c, `${path}.children[${i}]`, depth + 1))
    }
  }
  input.body.forEach((b, i) => visitBlock(b, `body[${i}]`, 1))
  for (const zone of ['top', 'bottom'] as const) {
    const z = input[zone]
    if (z === undefined) continue
    if (!isObject(z) || !Array.isArray(z.children)) add(zone, 'faixa inválida')
    else z.children.forEach((c, i) => visitBlock(c, `${zone}.children[${i}]`, 1))
  }

  // Todos os textos e valores, onde quer que estejam.
  const visitValue = (v: unknown, path: string, key: string, owner: string) => {
    if (typeof v === 'string') {
      if (key in FREE_TEXT) checkText(v, path, `${owner}.${key}`, FREE_TEXT[key], add)
      else if (v !== '' && !SIMPLE_VALUE.test(v)) add(path, `valor inválido: "${clip(v)}"`)
      return
    }
    if (typeof v === 'number') { if (!Number.isFinite(v) || Math.abs(v) > 10_000) add(path, 'número fora dos limites'); return }
    if (typeof v === 'boolean' || v === null) return
    if (Array.isArray(v)) { v.forEach((x, i) => visitValue(x, `${path}[${i}]`, key, owner)); return }
    if (isObject(v)) {
      const nextOwner = typeof v.type === 'string' ? v.type : owner
      for (const [k, x] of Object.entries(v)) {
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') { add(`${path}.${k}`, 'chave proibida'); continue }
        visitValue(x, path ? `${path}.${k}` : k, k, nextOwner)
      }
      return
    }
    add(path, 'valor não suportado')
  }
  visitValue(input, '', '', 'template')

  return issues
}

function checkText(text: string, path: string, where: string, max: number, add: (path: string, message: string) => void) {
  if (text.length > max) add(path, `texto com ${text.length} caracteres - o máximo aqui é ${max}`)
  if (INVISIBLE.test(text)) add(path, 'o texto tem caracteres invisíveis ou de controlo')

  for (const m of text.matchAll(/\{\{\s*([^}]*?)\s*\}\}/g)) {
    if (!(TEMPLATE_VARIABLES as readonly string[]).includes(m[1])) add(path, `variável desconhecida {{${m[1]}}} - use ${TEMPLATE_VARIABLES.map((v) => `{{${v}}}`).join(', ')}`)
  }
  // O que fica depois de tirar as variáveis é o que o autor escreveu.
  const literal = text.replace(/\{\{[^}]*\}\}/g, ' ')
  const q = `"${clip(text)}"`
  if (URL_LIKE.test(literal)) add(path, `${q}: ligações não podem estar no template - use {{org.website}}`)
  if (EMAIL_LIKE.test(literal)) add(path, `${q}: e-mails não podem estar no template - use {{org.email}}`)
  if (IBAN_LIKE.test(literal) || LONG_NUMBER.test(literal)) add(path, `${q}: números de conta, telefone, NIF ou referências não podem estar no template - vêm dos dados da empresa`)
  const seen = new Set<string>()
  for (const r of RESERVED) {
    if (r.allowedIn?.includes(where) || seen.has(r.what) || !r.re.test(literal)) continue
    seen.add(r.what)
    add(path, `${q}: parece ${r.what} - só os componentes do Vero podem escrever isto`)
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const clip = (s: string) => (s.length > 40 ? `${s.slice(0, 40)}…` : s)
