/**
 * Os componentes do @veroao/invoice, para a página Componentes. Os exemplos são ficheiros
 * reais em examples/<componente>/<variante>.tsx; as imagens (<variante>.webp) são geradas
 * a partir deles com `npm run examples -w packages/invoice`.
 */
export interface Prop { name: string; type: string; default?: string; description: string }
export interface ExampleRef { id: string; title: string; description?: string }

export interface ComponentDoc {
  slug: string
  name: string
  group: 'Estrutura' | 'Documento' | 'Conteúdo'
  summary: string
  /** Elemento obrigatório da AGT: se faltar, é acrescentado ao emitir. */
  required?: boolean
  props: Prop[]
  examples: ExampleRef[]
  notes?: string[]
}

export interface Example extends ExampleRef {
  image?: string
  /** Miniatura cortada à volta do conteúdo, para a vista geral. */
  thumb?: string
  loadCode: () => Promise<string>
}

const STYLED: Prop[] = [
  { name: 'className', type: 'string', description: 'Classes do Tailwind (ver Tailwind suportado).' },
  { name: 'style', type: 'PdfStyle', description: 'Estilos em objecto, em pt, como no react-pdf. Alternativa ao className.' },
]
const PARTY: Prop[] = [
  { name: 'label', type: 'string', description: 'Rótulo por cima do nome. Vazio ("") para não ter rótulo.' },
  { name: 'labelClassName', type: 'string', description: 'Aspecto do rótulo.' },
  { name: 'nameClassName', type: 'string', description: 'Aspecto do nome.' },
  { name: 'taxIdLabel', type: 'string', default: '"NIF:"', description: 'Texto antes do NIF.' },
]
const LABELLED: Prop[] = [
  { name: 'label', type: 'string', description: 'Rótulo.' },
  { name: 'labelClassName', type: 'string', description: 'Aspecto do rótulo.' },
  { name: 'inline', type: 'boolean', default: 'false', description: 'Rótulo e texto na mesma linha.' },
]

export const COMPONENT_DOCS: ComponentDoc[] = [
  // ── Estrutura
  {
    slug: 'tailwind', name: 'Tailwind', group: 'Estrutura',
    summary: 'As cores e as letras do modelo, como no tailwind.config. Envolve o <Document>.',
    props: [{ name: 'config', type: 'TailwindConfig', description: 'theme.extend.colors e theme.extend.fontFamily (sans, display). As cores ficam disponíveis como text-*, bg-*, border-*.' }],
    examples: [{ id: 'default', title: 'Cores e letra próprias', description: 'brand e brand-light vêm do config; font-display usa a Playfair Display.' }],
    notes: [
      'Letras disponíveis: Inter, Playfair Display, Helvetica e Times-Roman. A Inter e a Playfair Display vêm no pacote.',
      'background e foreground são os nomes reservados para o fundo da página e o texto principal.',
    ],
  },
  {
    slug: 'document', name: 'Document', group: 'Estrutura',
    summary: 'A página A4. É a raiz do modelo: tudo o que está dentro é o corpo do documento.',
    props: [{ name: 'className', type: 'string', description: 'bg-* = fundo da página, px-* = margens laterais, pt-* = margem acima do corpo, text-* = tamanho e cor do texto por omissão.' }, STYLED[1]],
    examples: [{ id: 'default', title: 'Página com fundo creme', description: 'O código QR da AGT aparece sempre no canto inferior direito da última página.' }],
  },
  {
    slug: 'header', name: 'Header', group: 'Estrutura',
    summary: 'Faixa a toda a largura no topo da primeira página, por cima das margens.',
    props: STYLED,
    examples: [{ id: 'default', title: 'Faixa escura com logótipo e título' }],
  },
  {
    slug: 'footer', name: 'Footer', group: 'Estrutura',
    summary: 'Faixa a toda a largura no fundo de todas as páginas.',
    props: [{ name: 'className', type: 'string', description: 'h-* = altura da faixa; bg-*, px-*, como numa caixa.' }, STYLED[1]],
    examples: [{ id: 'default', title: 'Rodapé com contactos e número de página' }],
    notes: ['O código QR fica sempre acima do rodapé, nunca por cima.'],
  },
  {
    slug: 'corner-decoration', name: 'CornerDecoration', group: 'Estrutura',
    summary: 'Faixas decorativas no canto superior direito da primeira página.',
    props: [{ name: 'color', type: 'string', description: 'Nome de uma cor do config ou hex.' }],
    examples: [{ id: 'default', title: 'Canto com a cor da marca' }],
  },
  {
    slug: 'row', name: 'Row', group: 'Estrutura',
    summary: 'Blocos lado a lado (flex-direction: row).',
    props: [{ name: 'children', type: 'ReactNode', description: 'Os blocos.' }, ...STYLED],
    examples: [
      { id: 'default', title: 'Duas colunas', description: 'flex-1 em cada filho divide a largura por igual.' },
      { id: 'justify', title: 'Nas pontas', description: 'justify-between e items-center.' },
    ],
  },
  {
    slug: 'column', name: 'Column', group: 'Estrutura',
    summary: 'Blocos empilhados, com gap e alinhamento.',
    props: [{ name: 'children', type: 'ReactNode', description: 'Os blocos.' }, ...STYLED],
    examples: [{ id: 'default', title: 'Alinhado à direita' }],
  },
  {
    slug: 'text', name: 'Text', group: 'Estrutura',
    summary: 'Texto livre. Aceita dados do documento entre {{ }}.',
    props: [{ name: 'children', type: 'string', description: 'O texto. Aceita {{org.name}}, {{org.website}}, {{customer.name}}, {{document.reference}} e {{document.number}}.' }, ...STYLED],
    examples: [{ id: 'default', title: 'Com dados do documento' }],
    notes: ['Nunca escrevas à mão números, NIF ou menções fiscais: vêm sempre dos componentes do documento.'],
  },
  {
    slug: 'spacer', name: 'Spacer', group: 'Estrutura',
    summary: 'Espaço vertical.',
    props: [{ name: 'className', type: 'string', description: 'h-* = altura do espaço.' }],
    examples: [{ id: 'default', title: 'h-12 entre o título e o cliente' }],
  },
  {
    slug: 'hr', name: 'Hr', group: 'Estrutura',
    summary: 'Linha horizontal.',
    props: [{ name: 'className', type: 'string', description: 'border-t-* = espessura, border-* = cor, my-* = espaço à volta.' }],
    examples: [{ id: 'default', title: 'Linha de 2 px' }],
  },
  {
    slug: 'logo', name: 'Logo', group: 'Estrutura',
    summary: 'O logótipo da empresa que emite. O modelo nunca traz um logótipo próprio.',
    props: [
      { name: 'className', type: 'string', description: 'h-* = altura do logótipo.' },
      { name: 'fallback', type: '"name" | "none"', default: '"name"', description: 'Sem imagem: mostrar o nome da empresa, ou nada.' },
      { name: 'fallbackClassName', type: 'string', description: 'Aspecto do nome quando não há imagem.' },
    ],
    examples: [{ id: 'default', title: 'Empresa sem logótipo' }],
  },
  // ── Documento
  {
    slug: 'document-title', name: 'DocumentTitle', group: 'Documento', required: true,
    summary: 'O tipo do documento: Factura, Factura-Recibo, Nota de Crédito, Nota de Débito ou Recibo.',
    props: [{ name: 'withCode', type: 'boolean', default: 'false', description: 'Acrescenta o código (" - FR").' }, ...STYLED],
    examples: [{ id: 'default', title: 'Por omissão' }, { id: 'with-code', title: 'Com código, em maiúsculas' }],
  },
  {
    slug: 'document-number', name: 'DocumentNumber', group: 'Documento', required: true,
    summary: 'A série e o número do documento.',
    props: [{ name: 'prefix', type: 'string', description: 'Texto antes do número. Aceita {{document.title}} e {{document.type}}.' }, ...STYLED],
    examples: [{ id: 'default', title: 'Por omissão' }, { id: 'prefix', title: 'Com prefixo' }],
  },
  {
    slug: 'document-date', name: 'DocumentDate', group: 'Documento', required: true,
    summary: 'A data (e a hora) de emissão.',
    props: [
      { name: 'prefix', type: 'string', description: 'Texto antes da data.' },
      { name: 'withTime', type: 'boolean', default: 'true', description: 'Mostra a hora.' },
      ...STYLED,
    ],
    examples: [{ id: 'default', title: 'Data e hora' }, { id: 'prefix', title: 'Só a data, com prefixo' }],
  },
  {
    slug: 'atcud', name: 'Atcud', group: 'Documento',
    summary: 'O código ATCUD. Se não o usares, aparece nas menções legais.',
    props: [{ name: 'prefix', type: 'string', default: '"ATCUD:"', description: 'Texto antes do código.' }, ...STYLED],
    examples: [{ id: 'default', title: 'Por omissão' }],
  },
  {
    slug: 'status-badge', name: 'StatusBadge', group: 'Documento',
    summary: 'O estado do documento: PAGO, POR PAGAR ou ANULADO.',
    props: STYLED,
    examples: [{ id: 'default', title: 'Factura por pagar' }, { id: 'paid', title: 'Factura-recibo paga' }],
  },
  {
    slug: 'customer', name: 'Customer', group: 'Documento', required: true,
    summary: 'O cliente: nome, NIF, morada e contactos.',
    props: [...PARTY, ...STYLED],
    examples: [{ id: 'default', title: 'Por omissão' }, { id: 'card', title: 'Em cartão, com rótulo próprio' }],
    notes: ['Sem NIF (consumidor final), o Vero escreve "Consumidor final" como manda a AGT.'],
  },
  {
    slug: 'issuer', name: 'Issuer', group: 'Documento', required: true,
    summary: 'A empresa que emite: nome, NIF, morada e contactos.',
    props: [...PARTY, ...STYLED],
    examples: [{ id: 'default', title: 'Por omissão' }, { id: 'side-by-side', title: 'Ao lado do cliente' }],
  },
  {
    slug: 'payment', name: 'Payment', group: 'Documento',
    summary: 'Como foi pago: método, referência e data. Só aparece em documentos pagos.',
    props: [{ name: 'label', type: 'string', default: '"Pagamento"', description: 'Rótulo.' }, { name: 'labelClassName', type: 'string', description: 'Aspecto do rótulo.' }, ...STYLED],
    examples: [{ id: 'default', title: 'Numa factura-recibo' }],
  },
  // ── Conteúdo
  {
    slug: 'items', name: 'Items', group: 'Conteúdo', required: true,
    summary: 'A tabela das linhas: descrição, quantidade, preço, IVA e total.',
    props: [
      { name: 'columns', type: 'ItemColumn[]', description: 'Que colunas mostrar e por que ordem: { field, label, width, className }. field: description, details, quantity, unitPrice, lineDiscount, taxRate, taxAmount, lineTotal.' },
      { name: 'headerClassName', type: 'string', description: 'Aspecto do cabeçalho da tabela.' },
      { name: 'rowClassName', type: 'string', description: 'Aspecto de cada linha. Aceita even:bg-* para linhas alternadas.' },
      { name: 'detailsClassName', type: 'string', description: 'Aspecto do texto por baixo da descrição.' },
      { name: 'gridClassName', type: 'string', description: 'Linhas entre colunas e à volta, ex.: "border border-zinc-300".' },
      { name: 'showCurrency', type: 'boolean', default: 'true', description: 'false = valores sem "Kz".' },
      ...STYLED,
    ],
    examples: [
      { id: 'default', title: 'Por omissão' },
      { id: 'dark-header', title: 'Cabeçalho escuro e linhas alternadas' },
      { id: 'grid', title: 'Com grelha' },
      { id: 'columns', title: 'Colunas à escolha', description: 'width é o peso da coluna (como flex).' },
    ],
    notes: ['A coluna do IVA mostra o código de isenção (M04…) nas linhas isentas.'],
  },
  {
    slug: 'totals', name: 'Totals', group: 'Conteúdo', required: true,
    summary: 'Totais sem impostos, IVA por taxa, descontos e o total.',
    props: [
      { name: 'byRate', type: 'boolean', default: 'true', description: 'false = uma só linha "Valor de impostos".' },
      { name: 'title', type: 'string', description: 'Título por cima dos totais.' },
      { name: 'totalLabel', type: 'string', description: 'Em vez de "TOTAL PAGO" / "TOTAL A PAGAR".' },
      { name: 'totalClassName', type: 'string', description: 'Aspecto do valor total.' },
      { name: 'totalRowClassName', type: 'string', description: 'Fundo e cor do texto da linha do total, ex.: "bg-zinc-900 text-white".' },
      { name: 'rowClassName', type: 'string', description: 'Linha entre valores, ex.: "border-b border-zinc-200".' },
      { name: 'ruleClassName', type: 'string', description: 'Cor do filete antes do total.' },
      { name: 'titleClassName', type: 'string', description: 'Aspecto do título.' },
      { name: 'showCurrency', type: 'boolean', default: 'true', description: 'false = valores sem "Kz".' },
      ...STYLED,
    ],
    examples: [{ id: 'default', title: 'Por omissão' }, { id: 'highlight', title: 'Total em destaque' }],
  },
  {
    slug: 'notes', name: 'Notes', group: 'Conteúdo',
    summary: 'As observações escritas em cada documento. Sem observações, não aparece.',
    props: [...LABELLED, ...STYLED],
    examples: [{ id: 'default', title: 'Por omissão' }, { id: 'inline', title: 'Com rótulo na mesma linha' }],
  },
  {
    slug: 'amount-in-words', name: 'AmountInWords', group: 'Conteúdo',
    summary: 'O total por extenso.',
    props: [...LABELLED, ...STYLED],
    examples: [{ id: 'default', title: 'Por omissão' }],
  },
  {
    slug: 'bank-accounts', name: 'BankAccounts', group: 'Conteúdo',
    summary: 'As contas bancárias da empresa, para transferência.',
    props: [
      { name: 'layout', type: '"list" | "table"', default: '"list"', description: 'Lista ou tabela.' },
      { name: 'label', type: 'string', default: '"Dados bancários"', description: 'Rótulo.' },
      { name: 'labelClassName', type: 'string', description: 'Aspecto do rótulo.' },
      { name: 'headerClassName', type: 'string', description: 'Cabeçalho da tabela.' },
      { name: 'gridClassName', type: 'string', description: 'Linhas da tabela.' },
      ...STYLED,
    ],
    examples: [{ id: 'default', title: 'Lista' }, { id: 'table', title: 'Tabela' }],
  },
  {
    slug: 'legal-notes', name: 'LegalNotes', group: 'Conteúdo', required: true,
    summary: 'ATCUD, motivos de isenção, texto legal e a menção do programa certificado.',
    props: [{ name: 'parts', type: 'FiscalPart[]', default: 'todas', description: 'Que menções mostrar: atcud, exemptions, legal, certification. Podes dividi-las por vários LegalNotes.' }, ...STYLED],
    examples: [{ id: 'default', title: 'Todas as menções' }, { id: 'parts', title: 'Divididas em duas colunas' }],
    notes: ['O texto fiscal nunca fica abaixo de 7 pt nem com pouco contraste: se for preciso, o Vero corrige e avisa.'],
  },
  {
    slug: 'page-number', name: 'PageNumber', group: 'Conteúdo',
    summary: 'PÁGINA 1 / 2. Útil no rodapé.',
    props: STYLED,
    examples: [{ id: 'default', title: 'Ao lado do número' }],
  },
]

const images = import.meta.glob<string>('../../../../examples/*/*.webp', { eager: true, query: '?url', import: 'default' })
const codes = import.meta.glob<string>('../../../../examples/*/*.tsx', { query: '?raw', import: 'default' })
const key = (path: string) => path.split('/').slice(-2).join('/').replace(/\.webp$|\.tsx$/, '')
const imageBy = Object.fromEntries(Object.entries(images).map(([p, url]) => [key(p), url]))
const codeBy = Object.fromEntries(Object.entries(codes).map(([p, load]) => [key(p), load]))

export function examplesOf(c: ComponentDoc): Example[] {
  return c.examples.map((e) => ({ ...e, image: imageBy[`${c.slug}/${e.id}`], thumb: imageBy[`${c.slug}/${e.id}.thumb`], loadCode: codeBy[`${c.slug}/${e.id}`] }))
}

export const findComponent = (slug: string) => COMPONENT_DOCS.find((c) => c.slug === slug)
export const COMPONENT_GROUPS = ['Estrutura', 'Documento', 'Conteúdo'] as const
