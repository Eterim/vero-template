import type { TemplateV2 } from '../src/index.js'

export interface Meta {
  slug: string
  name: string
  description: string
  author: { name: string; url?: string }
  collection: 'vero' | 'exemplos' | 'comunidade'
  version: number
  license: string
  docTypes: ('FT' | 'FR' | 'NC' | 'ND' | 'RC')[]
  tags: string[]
  updatedAt: string
}

/** O modelo.json de cada pasta - o que o Vero importa. */
export const importJson = (meta: Meta, slug: string, template: TemplateV2) => ({
  format: 'vero-template', schemaVersion: 2, id: `${meta.author.name}/${slug}`, version: meta.version, name: meta.name, author: meta.author.name, template,
})
