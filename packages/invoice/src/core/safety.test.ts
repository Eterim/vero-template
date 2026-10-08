import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { checkTemplate } from './safety.js'

const base = (body: unknown[]) => ({ version: 2, theme: { colors: { background: '#FFFFFF', foreground: '#111111' } }, body })
const text = (t: string) => base([{ type: 'text', text: t }])
const messages = (t: unknown) => checkTemplate(t).map((i) => i.message).join('\n')

describe('checkTemplate', () => {
  it('aceita os templates da galeria', () => {
    const root = new URL('../../../../templates/', import.meta.url)
    for (const d of readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory())) {
      const json = JSON.parse(readFileSync(new URL(`${d.name}/template.json`, root), 'utf8'))
      expect(checkTemplate(json.template), d.name).toEqual([])
    }
  })

  it('aceita textos normais e variáveis conhecidas', () => {
    expect(checkTemplate(text('Obrigado pela preferência, {{customer.name}}!'))).toEqual([])
    expect(checkTemplate(text('{{org.name}} · {{org.website}}'))).toEqual([])
  })

  it.each([
    ['IBAN', 'Pague para AO06 0040 0000 1234 5678 9012 3'],
    ['telefone', 'Ligue 923 456 789'],
    ['NIF', 'Empresa 5417123456'],
    ['ligação', 'Pague em pagar-aqui.com'],
    ['URL', 'Veja https://exemplo.ao/x'],
    ['e-mail', 'Escreva para contas@exemplo.ao'],
    ['programa certificado', 'Processado por programa válido n.º 1/AGT/2026'],
    ['certificação', 'Software certificado'],
    ['ATCUD fora do componente', 'ATCUD: 0'],
    ['via', 'Original'],
    ['estado', 'PAGO'],
    ['isenção', 'Isento nos termos do art. 12'],
    ['caracteres invisíveis', 'Olá‮mundo'],
  ])('recusa %s em texto livre', (_, t) => {
    expect(checkTemplate(text(t)).length).toBeGreaterThan(0)
  })

  it('aceita ATCUD só como prefixo do <Atcud />', () => {
    expect(checkTemplate(base([{ type: 'atcud', prefix: 'ATCUD:' }]))).toEqual([])
    expect(checkTemplate(base([{ type: 'documentNumber', prefix: 'ATCUD:' }]))).not.toEqual([])
  })

  it('recusa variáveis desconhecidas', () => {
    expect(messages(text('{{process.env.TOKEN}}'))).toMatch(/variável desconhecida/)
  })

  it('recusa valores arbitrários fora dos textos', () => {
    expect(messages(base([{ type: 'text', text: 'Olá', style: { color: 'javascript:alert(1)' } }]))).toMatch(/valor inválido/)
    expect(messages({ ...base([]), theme: { colors: { background: '#fff', foreground: 'url(x)' } } })).toMatch(/hex/)
  })

  it('recusa blocos desconhecidos, chaves proibidas e excessos', () => {
    expect(messages(base([{ type: 'image', src: 'x' }]))).toMatch(/bloco desconhecido/)
    expect(messages(JSON.parse('{"version":2,"theme":{"colors":{"background":"#fff","foreground":"#000"}},"body":[],"__proto__":{"x":1}}'))).toMatch(/chave proibida/)
    expect(messages(base(Array.from({ length: 401 }, () => ({ type: 'spacer', size: 1 }))))).toMatch(/blocos a mais/)
    let deep: unknown = { type: 'text', text: 'x' }
    for (let i = 0; i < 20; i++) deep = { type: 'stack', children: [deep] }
    expect(messages(base([deep]))).toMatch(/níveis/)
  })

  it('recusa o que não é um template v2', () => {
    expect(messages({ version: 1 })).toMatch(/formato desconhecido/)
    expect(messages('texto')).toMatch(/formato desconhecido/)
  })
})
