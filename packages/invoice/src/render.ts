/**
 * render(): do template (React ou JSON) e dos dados do documento ao PDF.
 * Funciona sem o Vero - os dados (número, ATCUD, hash, certificação, QR…) são de quem chama.
 */
import { isValidElement, type ReactNode } from 'react'
import { pdf } from '@react-pdf/renderer'
import { compile } from './compile.js'
import { buildDocumentV2 } from './core/render.js'
import type { DocumentData, RenderWarning, TemplateV2 } from './core/types.js'

export interface RenderOptions {
  /**
   * false só para editores/pré-visualização: o que faltar fica de fora e vem nos avisos.
   * Por omissão (e sempre num documento emitido) os elementos obrigatórios em falta são acrescentados.
   */
  insertMissing?: boolean
}

export interface RenderResult {
  pdf: Uint8Array
  warnings: RenderWarning[]
  template: TemplateV2
}

const isTemplate = (x: unknown): x is TemplateV2 => !!x && typeof x === 'object' && (x as TemplateV2).version === 2 && Array.isArray((x as TemplateV2).body)

/** Aceita o elemento React (<Template />), o JSON do template, ou o JSON de importação do Vero ({ format, template }). */
export function toTemplate(model: ReactNode | TemplateV2 | { template: TemplateV2 }): TemplateV2 {
  if (isValidElement(model)) return compile(model)
  if (isTemplate(model)) return model
  if (model && typeof model === 'object' && 'template' in model && isTemplate((model as { template: unknown }).template)) return (model as { template: TemplateV2 }).template
  throw new TypeError('render(): esperava <Template />, um template JSON ou o JSON de importação do Vero')
}

export async function render(model: ReactNode | TemplateV2 | { template: TemplateV2 }, data: DocumentData, opts: RenderOptions = {}): Promise<RenderResult> {
  const template = toTemplate(model)
  const { document, warnings } = await buildDocumentV2(template, data, opts)
  const blob = await pdf(document as Parameters<typeof pdf>[0]).toBlob()
  // os avisos são preenchidos durante o desenho - lêem-se depois do PDF estar pronto
  return { pdf: new Uint8Array(await blob.arrayBuffer()), warnings, template }
}
