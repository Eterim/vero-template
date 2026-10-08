import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findTemplates } from './dev'

describe('findTemplates', () => {
  it('finds loose .tsx files and gallery folders, skipping private ones', () => {
    const dir = mkdtempSync(join(tmpdir(), 'veroao-find-'))
    writeFileSync(join(dir, 'b-invoice.tsx'), '')
    writeFileSync(join(dir, '_shared.tsx'), '')
    writeFileSync(join(dir, 'notes.md'), '')
    mkdirSync(join(dir, 'a-classic'))
    writeFileSync(join(dir, 'a-classic', 'modelo.tsx'), '')
    mkdirSync(join(dir, 'empty'))
    mkdirSync(join(dir, 'node_modules'))
    expect([...findTemplates(dir).keys()]).toEqual(['a-classic', 'b-invoice'])
  })
})
