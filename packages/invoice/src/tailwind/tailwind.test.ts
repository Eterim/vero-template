import { describe, expect, it } from 'vitest'
import { parseClasses } from './tailwind.js'

const theme = { accent: '#C9A227', muted: '#6B7280' }
const s = (c: string) => {
  const r = parseClasses(c, theme)
  if (r.errors.length) throw new Error(r.errors.join('; '))
  return r
}

describe('medidas (1 px = 0,75 pt, como na web)', () => {
  it('escala e valores livres', () => {
    expect(s('p-4 px-[53px] mt-1 gap-5').style).toEqual({ padding: 12, paddingX: 39.75, marginTop: 3, gap: 15 })
    expect(s('text-sm').style.size).toBe(10.5)
    expect(s('text-[10.5px]').style.size).toBe(7.875)
    expect(s('text-[9pt]').style.size).toBe(9)
    expect(s('ml-auto w-1/2 h-[40px]').style).toEqual({ marginLeft: 'auto', width: '50%', height: 30 })
  })
})

describe('cores', () => {
  it('do config ficam com o nome, da paleta e livres viram hex', () => {
    expect(s('bg-accent text-muted').style).toEqual({ background: 'accent', color: 'muted' })
    expect(s('bg-zinc-100 text-teal-900').style).toEqual({ background: '#f4f4f5', color: '#134e4a' })
    expect(s('text-[#C9A227] bg-[#fff]').style).toEqual({ color: '#C9A227', background: '#ffffff' })
  })
})

describe('texto', () => {
  it('peso, maiúsculas, alinhamento, linhas e letras', () => {
    expect(s('font-bold uppercase text-right leading-tight tracking-wide text-[12px]').style)
      .toEqual({ weight: 700, uppercase: true, align: 'right', lineHeight: 1.25, size: 9, letterSpacing: 0.225 })
    expect(s('font-display').style.font).toBe('display')
  })
})

describe('bordas', () => {
  it('contorno, lados, espessuras e cor herdada', () => {
    expect(s('border border-zinc-300').style.border).toEqual({ width: 0.75, color: '#d4d4d8' })
    expect(s('border-b border-muted').style).toEqual({ borderBottom: { width: 0.75, color: 'muted' } })
    expect(s('border-t-4 border-t-accent').style.borderTop).toEqual({ width: 3, color: 'accent' })
    expect(s('border-[0.5px]').style.border).toEqual({ width: 0.375, color: '#e5e7eb' })
  })
})

describe('even: (linhas alternadas)', () => {
  it('vai para o estilo par', () => {
    const r = s('py-2 even:bg-zinc-50')
    expect(r.style).toEqual({ paddingY: 6 })
    expect(r.even).toEqual({ background: '#fafafa' })
  })
})

describe('o que não existe num PDF', () => {
  it.each([
    ['hover:bg-zinc-100', 'interacção'],
    ['md:px-8', 'A4'],
    ['dark:bg-black', 'modo escuro'],
    ['shadow-lg', 'sombras'],
    ['grid-cols-2', '<Row>'],
    ['absolute', 'posicionamento'],
    ['space-y-2', 'gap-*'],
    ['odd:bg-zinc-50', 'even:'],
    ['bg-deep-purple', 'cor desconhecida'],
    ['qualquer-coisa', 'não existe'],
  ])('%s', (cls, msg) => {
    const r = parseClasses(cls, theme)
    expect(r.errors.join('\n')).toContain(msg)
  })
})
