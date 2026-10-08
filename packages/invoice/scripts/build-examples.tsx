/**
 * Gera as imagens dos exemplos da página Componentes: para cada examples/<componente>/<variante>.tsx,
 * desenha o exemplo numa página A4 e grava <variante>.webp ao lado, cortado à volta do que lá está.
 *
 *   npm run examples -w packages/invoice            (todos)
 *   npm run examples -w packages/invoice -- items   (só um componente)
 */
import { readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type FC } from 'react'
import sharp from 'sharp'
import { compile, Document, render, sampleDocument, type DocumentData } from '../src/index.js'
import { rasterize } from './raster.js'

const ROOT = new URL('../../../examples/', import.meta.url).pathname
const WIDTH = 900
const SCALE = 1.5
const PT = (WIDTH * SCALE) / 595.28 // px por pt na imagem desenhada
const only = process.argv.slice(2)

interface ExampleModule {
  default: FC
  /** O exemplo é o template inteiro (<Tailwind>/<Document>). */
  page?: boolean
  /** Num exemplo de página inteira, cortar à volta do conteúdo (ex.: só o cabeçalho). */
  crop?: boolean
  docType?: DocumentData['documentType']
}

/** Caixa com conteúdo [x0, y0, x1, y1]: píxeis diferentes do fundo. O QR (fundo da página) não conta. */
function contentBox(data: Uint8ClampedArray, w: number, h: number, bg: [number, number, number]): [number, number, number, number] | null {
  let x0 = w, y0 = -1, x1 = -1, y1 = -1
  const limit = Math.floor(h * 0.72)
  for (let y = 0; y < limit; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 30) {
        if (y0 < 0) y0 = y
        y1 = y
        if (x < x0) x0 = x
        if (x > x1) x1 = x
      }
    }
  }
  return y0 < 0 ? null : [x0, y0, x1, y1]
}

const components = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  .filter((c) => !only.length || only.includes(c))

for (const component of components) {
  const dir = join(ROOT, component)
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
    const mod = (await import(join(dir, file))) as ExampleModule
    const element = mod.page
      ? createElement(mod.default)
      : createElement(Document, { className: 'bg-white px-12 pt-10 text-[11px]' }, createElement(mod.default))
    const template = compile(element)
    const { pdf, warnings } = await render(template, sampleDocument(mod.docType ?? 'FR'), { insertMissing: false })
    for (const w of warnings.filter((x) => x.kind !== 'missing')) console.warn(`  ! ${component}/${file}: ${w.message}`)

    const canvas = await rasterize(pdf, WIDTH * SCALE)
    const png = canvas.toBuffer('image/png')
    const { width: w, height: h } = canvas
    const data = canvas.getContext('2d').getImageData(0, 0, w, h).data
    const at = (Math.floor(h * 0.8) * w + 4) * 4
    const box = contentBox(data, w, h, [data[at], data[at + 1], data[at + 2]])
    if (!box) throw new Error(`${component}/${file}: o exemplo não desenhou nada`)
    const pad = Math.round(28 * PT)
    const out = (name: string) => join(dir, file.replace(/\.tsx$/, name))

    // Imagem do exemplo: a largura toda da página, cortada em cima e em baixo.
    let img = sharp(png)
    let thumb = sharp(png)
    if (!mod.page || mod.crop) {
      const y0 = mod.page ? 0 : Math.max(0, box[1] - pad)
      const y1 = Math.min(h, box[3] + pad)
      img = sharp(await img.extract({ left: 0, top: y0, width: w, height: y1 - y0 }).png().toBuffer())
      // Miniatura (vista geral): só à volta do conteúdo, para se ler em ponto pequeno.
      const x0 = mod.page ? 0 : Math.max(0, box[0] - pad)
      const x1 = mod.page ? w : Math.min(w, box[2] + pad)
      thumb = sharp(await sharp(png).extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }).png().toBuffer())
    }
    writeFileSync(out('.webp'), await img.resize({ width: WIDTH }).webp({ quality: 86, effort: 6 }).toBuffer())
    writeFileSync(out('.thumb.webp'), await thumb.resize({ width: 520, height: 320, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86, effort: 6 }).toBuffer())
  }
  console.log(`✓ ${component}`)
}
