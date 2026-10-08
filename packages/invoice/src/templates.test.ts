import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createElement, type FC } from 'react'
import { describe, expect, it } from 'vitest'
import { compile, render, sampleDocument } from './index.js'

// A prova de que o código da galeria é verdadeiro: cada templates/*/modelo.tsx compila e
// desenha os cinco documentos sem avisos.
const ROOT = new URL('../../../templates/', import.meta.url).pathname
const SLUGS = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)

describe.each(SLUGS)('templates/%s', (slug) => {
  it('compila e desenha FT, FR, NC, ND e RC sem avisos', async () => {
    const mod = (await import(join(ROOT, slug, 'modelo.tsx'))) as { default: FC }
    const template = compile(createElement(mod.default))
    expect(template.body.length).toBeGreaterThan(0)
    for (const dt of ['FT', 'FR', 'NC', 'ND', 'RC'] as const) {
      const { pdf, warnings } = await render(template, sampleDocument(dt))
      expect(new TextDecoder().decode(pdf.subarray(0, 4))).toBe('%PDF')
      expect(warnings.map((w) => w.message), `${slug} ${dt}`).toEqual([])
    }
  })

  it('tem meta.json válido', () => {
    const meta = JSON.parse(readFileSync(join(ROOT, slug, 'meta.json'), 'utf8'))
    expect(meta.slug).toBe(slug)
    expect(meta.docTypes).toEqual(['FT', 'FR', 'NC', 'ND', 'RC'])
  })
})
