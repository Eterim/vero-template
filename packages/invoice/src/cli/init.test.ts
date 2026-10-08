import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkTemplate } from '../core/safety'
import { init } from './init'
import { loadTemplate } from './load'

describe('init', () => {
  it('cria um projecto cujo modelo compila e passa as verificações', async () => {
    const root = init({ dir: join(mkdtempSync(join(tmpdir(), 'veroao-init-')), 'Minhas Facturas'), version: '1.2.3' })
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    expect(pkg.name).toBe('minhas-facturas')
    expect(pkg.dependencies['@veroao/invoice']).toBe('^1.2.3')
    expect(existsSync(join(root, 'tsconfig.json'))).toBe(true)
    const r = await loadTemplate(join(root, 'templates', 'invoice.tsx'))
    expect(r.errors).toBeUndefined()
    expect(checkTemplate(r.template)).toEqual([])
  })

  it('não escreve por cima de uma pasta com ficheiros', () => {
    const dir = mkdtempSync(join(tmpdir(), 'veroao-init-'))
    init({ dir, version: '1.0.0' })
    expect(() => init({ dir, version: '1.0.0' })).toThrow(/já existe/)
  })
})
