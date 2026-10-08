/**
 * Os modelos da galeria vêm das pastas templates/<nome>/ do repositório:
 * meta.json, modelo.tsx, modelo.json e preview-<tipo>.webp. Acrescentar um modelo
 * é acrescentar uma pasta (por pull request).
 */
export type DocType = 'ft' | 'fr' | 'nc' | 'nd' | 'rc'

export interface TemplateMeta {
  slug: string
  name: string
  description: string
  author: { name: string; url?: string }
  collection: 'vero' | 'exemplos' | 'comunidade'
  version: number
  license: string
  docTypes: string[]
  tags: string[]
  updatedAt: string
}

export interface Template extends TemplateMeta {
  previews: Partial<Record<DocType, string>>
  /** Carregados só na página do modelo. */
  loadCode: () => Promise<string>
  loadJson: () => Promise<string>
}

const metas = import.meta.glob<TemplateMeta>('../../../../templates/*/meta.json', { eager: true, import: 'default' })
const previews = import.meta.glob<string>('../../../../templates/*/preview-*.webp', { eager: true, query: '?url', import: 'default' })
const codes = import.meta.glob<string>('../../../../templates/*/modelo.tsx', { query: '?raw', import: 'default' })
const jsons = import.meta.glob<string>('../../../../templates/*/modelo.json', { query: '?raw', import: 'default' })

const folder = (path: string) => path.split('/').slice(-2, -1)[0]
const ORDER: Record<TemplateMeta['collection'], number> = { vero: 0, comunidade: 1, exemplos: 2 }

export const TEMPLATES: Template[] = Object.entries(metas)
  .map(([path, meta]) => {
    const dir = folder(path)
    const own = Object.entries(previews).filter(([p]) => folder(p) === dir)
    const byType = Object.fromEntries(own.map(([p, url]) => [p.match(/preview-(\w+)\.webp$/)![1], url])) as Template['previews']
    const codeKey = Object.keys(codes).find((p) => folder(p) === dir)!
    const jsonKey = Object.keys(jsons).find((p) => folder(p) === dir)!
    return { ...meta, previews: byType, loadCode: codes[codeKey], loadJson: jsons[jsonKey] }
  })
  .sort((a, b) => ORDER[a.collection] - ORDER[b.collection])

export const findTemplate = (slug: string) => TEMPLATES.find((t) => t.slug === slug)

export const DOC_TYPE_LABEL: Record<DocType, string> = {
  ft: 'Factura', fr: 'Factura-recibo', nc: 'Nota de crédito', nd: 'Nota de débito', rc: 'Recibo',
}
