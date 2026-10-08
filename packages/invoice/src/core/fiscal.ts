import { REQUIRED_FISCAL_PARTS, type Block, type BlockType, type FiscalPart, type RenderWarning, type TemplateV2 } from './types.js'

/**
 * Blocos que o documento fiscal tem de ter. Quem desenha decide onde ficam e com
 * que aspecto; se faltar algum, o Vero acrescenta-o - nunca sai um documento sem eles.
 */
export const FISCAL_BLOCKS: { type: BlockType; role?: 'issuer' | 'customer'; label: string; element: string }[] = [
  { type: 'documentTitle', label: 'Tipo do documento', element: 'O tipo do documento' },
  { type: 'documentNumber', label: 'Número', element: 'O número do documento' },
  { type: 'documentDate', label: 'Data de emissão', element: 'A data de emissão' },
  { type: 'party', role: 'issuer', label: 'Emitente (nome e NIF)', element: 'O emitente' },
  { type: 'party', role: 'customer', label: 'Cliente (nome e NIF)', element: 'O cliente' },
  { type: 'items', label: 'Linhas com IVA', element: 'A tabela de artigos' },
  { type: 'totals', label: 'Totais', element: 'Os totais' },
]

function walk(blocks: Block[] | undefined, visit: (b: Block) => void) {
  for (const b of blocks ?? []) {
    visit(b)
    if ('children' in b) walk(b.children, visit)
  }
}

export interface FiscalCheck {
  template: TemplateV2
  warnings: RenderWarning[]
}

/**
 * Verifica os elementos fiscais. Com `insert` (por omissão, e sempre num documento emitido),
 * os que faltam são acrescentados. Sem `insert` (o editor), o template fica como está e cada
 * aviso traz o bloco para o editor o acrescentar com um clique.
 */
export function ensureFiscalBlocks(template: TemplateV2, opts: { insert?: boolean } = {}): FiscalCheck {
  const insert = opts.insert !== false
  const found = new Set<string>()
  const counts = new Map<string, number>()
  // As menções legais podem estar repartidas (ex.: ATCUD no topo, programa certificado no rodapé).
  const parts = new Set<FiscalPart>()
  for (const zone of [template.top?.children, template.body, template.bottom?.children]) {
    walk(zone, (b) => {
      const key = b.type === 'party' ? `party:${b.role}` : b.type
      found.add(key)
      counts.set(key, (counts.get(key) ?? 0) + 1)
      if (b.type === 'fiscal') (b.parts ?? REQUIRED_FISCAL_PARTS).forEach((p) => parts.add(p))
      if (b.type === 'atcud') parts.add('atcud')
    })
  }

  const warnings: RenderWarning[] = []
  const head: Block[] = []
  const tail: Block[] = []
  for (const f of FISCAL_BLOCKS) {
    const key = f.role ? `party:${f.role}` : f.type
    if ((counts.get(key) ?? 0) > 1) warnings.push({ kind: 'duplicate', element: f.element, message: `${f.element}: aparece mais de uma vez no template - deve aparecer só uma.` })
    if (found.has(key)) continue
    const block = (f.role ? { type: 'party', role: f.role } : { type: f.type }) as Block
    const atStart = ['documentTitle', 'documentNumber', 'documentDate', 'party'].includes(f.type)
    if (atStart) head.push(block)
    else tail.push(block)
    warnings.push({
      kind: 'missing', element: f.element,
      message: insert
        ? `${f.element}: elemento obrigatório que não estava no template - o Vero acrescentou-o ${atStart ? 'no início' : 'no fim'} do documento.`
        : `${f.element}: obrigatório em todos os documentos.`,
      fix: { label: 'Acrescentar', addBlock: block, atStart },
    })
  }
  const missingParts = REQUIRED_FISCAL_PARTS.filter((p) => !parts.has(p))
  if (missingParts.length) {
    tail.push(missingParts.length === REQUIRED_FISCAL_PARTS.length ? { type: 'fiscal' } : { type: 'fiscal', parts: [...missingParts] })
    const names: Record<FiscalPart, string> = { atcud: 'ATCUD', exemptions: 'motivos de isenção', legal: 'texto legal', certification: 'programa certificado' }
    const detail = missingParts.map((p) => names[p]).join(', ')
    warnings.push({
      kind: 'missing', element: 'As menções legais',
      message: insert
        ? `As menções legais (${detail}): elemento obrigatório que não estava no template - o Vero acrescentou-o no fim do documento.`
        : `As menções legais (${detail}): obrigatórias em todos os documentos.`,
      fix: { label: 'Acrescentar', addBlock: tail[tail.length - 1], atStart: false },
    })
  }
  if (!insert || (!head.length && !tail.length)) return { template, warnings }
  return { template: { ...template, body: [...head, ...template.body, ...tail] }, warnings }
}
