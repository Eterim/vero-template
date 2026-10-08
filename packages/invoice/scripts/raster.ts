/** PDF → imagem (pdf.js + canvas + sharp), para as pré-visualizações do site. */
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas, type Canvas } from '@napi-rs/canvas'

// Letras-padrão do PDF (Helvetica, Times…) que vêm com o pdf.js
const STANDARD_FONTS = join(dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json')), 'standard_fonts') + '/'

/** Desenha a 1.ª página com `width` px de largura. */
export async function rasterize(pdfBytes: Uint8Array, width: number): Promise<Canvas> {
  const doc = await pdfjs.getDocument({ data: pdfBytes, standardFontDataUrl: STANDARD_FONTS, useSystemFonts: false, disableFontFace: true }).promise
  const page = await doc.getPage(1)
  const base = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale: width / base.width })
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvas: canvas as never, canvasContext: ctx as never, viewport }).promise
  return canvas
}
