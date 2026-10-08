import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { describe, expect, it } from 'vitest'
import { render } from '../render.js'
import { sampleDocument } from './sample.js'
import type { DocumentData, TemplateV2 } from './types.js'

const template = (slug: string): TemplateV2 =>
  JSON.parse(readFileSync(new URL(`../../../../templates/${slug}/modelo.json`, import.meta.url), 'utf8')).template

const FONTS = join(dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json')), 'standard_fonts') + '/'

/** Texto de cada página do PDF. */
async function pages(data: DocumentData, slug = 'limpo'): Promise<string[]> {
  const { pdf } = await render(template(slug), data)
  const doc = await pdfjs.getDocument({ data: pdf, standardFontDataUrl: FONTS }).promise
  const out: string[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const c = await (await doc.getPage(p)).getTextContent()
    out.push(c.items.map((i) => ('str' in i ? i.str : '')).join(' ').replace(/\s+/g, ' '))
  }
  return out
}

const count = (text: string, s: string) => text.split(s).length - 1

describe('elementos fiscais do motor', () => {
  it('rodapé AGT em todas as páginas, com o número do documento; QR só na última', async () => {
    const ft = sampleDocument('FT')
    const lines = Array.from({ length: 45 }, (_, i) => ({ ...ft.lines[1], description: `Artigo ${i + 1}` }))
    const ps = await pages({ ...ft, lines })
    expect(ps.length).toBeGreaterThan(1)
    for (const p of ps) {
      expect(p).toContain('Ab3x-Processado por programa válido nº FE/271/AGT/2026')
      expect(p).toContain('FT VERO2026/128')
    }
    expect(ps.slice(0, -1).some((p) => p.includes('Verificar factura - AGT'))).toBe(false)
    expect(ps.at(-1)).toContain('Verificar factura - AGT')
  })

  it('a menção do programa certificado aparece uma só vez por página, mesmo que o modelo a peça', async () => {
    const [p] = await pages(sampleDocument('FT'), 'classico')
    expect(count(p, 'Processado por programa')).toBe(1)
  })

  it('retenção na fonte e valor líquido, sem mudar o total', async () => {
    const [p] = await pages({ ...sampleDocument('FT'), withholding: { type: 'II', rate: 6.5, amount: 2_500_00 } })
    expect(p).toContain('Retenção na fonte (II 6,5%)')
    expect(p).toContain('-2 500,00 Kz')
    expect(p).toContain('42 442,31 Kz') // total fiscal
    expect(p).toContain('Valor líquido a pagar')
    expect(p).toContain('39 942,31 Kz')
  })

  it('menção do regime simplificado', async () => {
    const ft = sampleDocument('FT')
    expect((await pages(ft))[0]).not.toContain('Regime Simplificado')
    expect((await pages({ ...ft, org: { ...ft.org, ivaRegime: 'simplificado' } }))[0]).toContain('IVA - Regime Simplificado')
  })

  it('"Não sujeito" nas linhas M02', async () => {
    const [p] = await pages(sampleDocument('RC'))
    expect(p).toContain('Não sujeito')
  })

  it('marca de água num documento anulado', async () => {
    const ft = sampleDocument('FT')
    expect((await pages({ ...ft, status: 'cancelled' }))[0]).toContain('ANULADO')
    expect((await pages({ ...ft, status: 'cancelled', cancelledLabel: 'CANCELADO' }))[0]).toContain('CANCELADO')
  })

  it('pró-forma: aviso obrigatório, sem QR, ATCUD nem assinatura', async () => {
    const [p] = await pages(sampleDocument('PF'), 'classico')
    expect(p).toContain('DOCUMENTO NÃO VÁLIDO COMO FACTURA')
    expect(p).toContain('Factura Pró-forma'.toUpperCase())
    expect(p).not.toContain('Verificar factura - AGT')
    expect(p).not.toContain('ATCUD')
    expect(p).not.toContain('colocados à disposição')
    expect(p).toContain('Processado por programa válido nº FE/271/AGT/2026')
    expect(p).not.toContain('-Processado')
  })

  it('contas bancárias completas', async () => {
    const ft = sampleDocument('FT')
    const [p] = await pages({ ...ft, org: { ...ft.org, bankAccounts: [{ bank: 'BAI', iban: 'AO06 0040', account: '1234567', swift: 'BAIPAOLU', notes: 'Indicar a factura' }] } }, 'classico')
    for (const s of ['1234567', 'BAIPAOLU', 'Indicar a factura']) expect(p).toContain(s)
  })
})
