/**
 * Gera, para cada templates/<nome>/modelo.tsx, o modelo.json (o que o Vero importa) e as
 * pré-visualizações preview-<tipo>.webp. O modelo.tsx é a fonte; o resto não se edita à mão.
 *
 *   npm run templates -w packages/invoice            (todos)
 *   npm run templates -w packages/invoice -- azul    (só um)
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'
import { createElement, type FC } from 'react'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from '@napi-rs/canvas'
import sharp from 'sharp'
import { compile, render, sampleDocument } from '../src/index.js'

const ROOT = new URL('../../../templates/', import.meta.url).pathname
// Letras-padrão do PDF (Helvetica, Times…) que vêm com o pdf.js
const STANDARD_FONTS = join(dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json')), 'standard_fonts') + '/'
const only = process.argv.slice(2)
const slugs = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  .filter((s) => !only.length || only.includes(s))

async function toWebp(pdfBytes: Uint8Array, width = 900): Promise<Buffer> {
  const doc = await pdfjs.getDocument({ data: pdfBytes, standardFontDataUrl: STANDARD_FONTS, useSystemFonts: false, disableFontFace: true }).promise
  const page = await doc.getPage(1)
  const base = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale: (width * 1.5) / base.width })
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvas: canvas as never, canvasContext: ctx as never, viewport }).promise
  return sharp(canvas.toBuffer('image/png')).resize({ width }).webp({ quality: 84, effort: 6 }).toBuffer()
}

for (const slug of slugs) {
  const dir = join(ROOT, slug)
  const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'))
  const mod = (await import(join(dir, 'modelo.tsx'))) as { default: FC }
  const template = compile(createElement(mod.default))
  writeFileSync(join(dir, 'modelo.json'), JSON.stringify({
    format: 'vero-template', schemaVersion: 2, id: `${meta.author.name}/${slug}`, version: meta.version, name: meta.name, author: meta.author.name, template,
  }, null, 2) + '\n')
  for (const dt of meta.docTypes as ('FT' | 'FR' | 'NC' | 'ND' | 'RC')[]) {
    const { pdf, warnings } = await render(template, sampleDocument(dt))
    if (warnings.length) throw new Error(`${slug} ${dt}: ${warnings.map((w) => w.message).join('; ')}`)
    writeFileSync(join(dir, `preview-${dt.toLowerCase()}.webp`), await toWebp(pdf))
  }
  console.log(`✓ ${slug}`)
}
