/**
 * Gera, para cada templates/<nome>/modelo.tsx, o modelo.json (o que o Vero importa) e as
 * pré-visualizações preview-<tipo>.webp. O modelo.tsx é a fonte; o resto não se edita à mão.
 *
 *   npm run templates -w packages/invoice            (todos)
 *   npm run templates -w packages/invoice -- azul    (só um)
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type FC } from 'react'
import sharp from 'sharp'
import { compile, render, sampleDocument } from '../src/index.js'
import { rasterize } from './raster.js'
import { importJson, type Meta } from './import-json.js'

const ROOT = new URL('../../../templates/', import.meta.url).pathname
const only = process.argv.slice(2)
const slugs = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  .filter((s) => !only.length || only.includes(s))

async function toWebp(pdfBytes: Uint8Array, width = 900): Promise<Buffer> {
  const canvas = await rasterize(pdfBytes, width * 1.5)
  return sharp(canvas.toBuffer('image/png')).resize({ width }).webp({ quality: 84, effort: 6 }).toBuffer()
}

for (const slug of slugs) {
  const dir = join(ROOT, slug)
  const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8')) as Meta
  const mod = (await import(join(dir, 'modelo.tsx'))) as { default: FC }
  const template = compile(createElement(mod.default))
  writeFileSync(join(dir, 'modelo.json'), JSON.stringify(importJson(meta, slug, template), null, 2) + '\n')
  for (const dt of meta.docTypes) {
    const { pdf, warnings } = await render(template, sampleDocument(dt))
    if (warnings.length) throw new Error(`${slug} ${dt}: ${warnings.map((w) => w.message).join('; ')}`)
    writeFileSync(join(dir, `preview-${dt.toLowerCase()}.webp`), await toWebp(pdf))
  }
  console.log(`✓ ${slug}`)
}
