import { pdf } from '@react-pdf/renderer'
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { buildDocumentV2 } from '../../src/core/render'
import { sampleDocument } from '../../src/core/sample'
import type { DocumentData, RenderWarning, TemplateV2 } from '../../src/core/types'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export type DocType = DocumentData['documentType']

/** PDF real (react-pdf) → páginas em canvas (pdf.js). Um desenho de cada vez. */
let queue: Promise<unknown> = Promise.resolve()
export function renderPages(template: TemplateV2, docType: DocType, cssWidth: number) {
  const job = queue.then(async () => {
    const t0 = performance.now()
    const { document, warnings } = await buildDocumentV2(template, sampleDocument(docType), { insertMissing: false })
    const blob = await pdf(document as Parameters<typeof pdf>[0]).toBlob()
    const doc = await pdfjs.getDocument({ data: await blob.arrayBuffer() }).promise
    const ratio = window.devicePixelRatio || 1
    const canvases: HTMLCanvasElement[] = []
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n)
      const scale = cssWidth / page.getViewport({ scale: 1 }).width
      const vp = page.getViewport({ scale: scale * ratio })
      const canvas = window.document.createElement('canvas')
      canvas.width = Math.floor(vp.width)
      canvas.height = Math.floor(vp.height)
      canvas.style.width = `${Math.floor(cssWidth)}px`
      await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
      canvases.push(canvas)
    }
    return { canvases, warnings: warnings as RenderWarning[], ms: Math.round(performance.now() - t0) }
  })
  queue = job.catch(() => undefined)
  return job
}

/** PDF para descarregar: como num documento emitido (o que faltar é acrescentado). */
export async function downloadPdf(template: TemplateV2, docType: DocType, name: string) {
  const { document } = await buildDocumentV2(template, sampleDocument(docType))
  const blob = await pdf(document as Parameters<typeof pdf>[0]).toBlob()
  const a = Object.assign(window.document.createElement('a'), { href: URL.createObjectURL(blob), download: `${name}-${docType.toLowerCase()}.pdf` })
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
