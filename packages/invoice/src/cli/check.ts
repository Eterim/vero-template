/**
 * `npx @veroao/invoice check [pasta]` - o que o Vero e a galeria verificam, antes de publicar:
 * o template compila, desenha os seis tipos de documento (com a pró-forma) sem avisos da AGT e passa a
 * verificação de segurança (checkTemplate).
 */
import { relative } from 'node:path'
import { checkTemplate } from '../core/safety.js'
import { sampleDocument } from '../core/sample.js'
import { render } from '../render.js'
import { findDir, findTemplates } from './dev.js'
import { loadTemplate } from './load.js'

const DOC_TYPES = ['FT', 'FR', 'NC', 'ND', 'RC', 'PF'] as const

/** Devolve o número de templates com problemas. */
export async function check(dir?: string): Promise<number> {
  const root = findDir(dir)
  const files = findTemplates(root)
  if (!files.size) {
    console.error(`\n  Nenhum template em ${relative(process.cwd(), root) || '.'} (ficheiros .tsx com export default).\n`)
    return 1
  }
  let failed = 0
  for (const [name, file] of files) {
    const problems: string[] = []
    const r = await loadTemplate(file)
    r.errors?.forEach((e) => problems.push(e.component ? `<${e.component}> ${e.message}` : e.message))
    if (r.template) {
      checkTemplate(r.template).forEach((i) => problems.push(`${i.path || 'template'}: ${i.message}`))
      for (const dt of DOC_TYPES) {
        const { warnings } = await render(r.template, sampleDocument(dt))
        warnings.forEach((w) => problems.push(`${dt}: ${w.message}`))
      }
    }
    if (problems.length) failed++
    console.log(problems.length ? `  ✗ ${name}\n${[...new Set(problems)].map((p) => `      - ${p}`).join('\n')}` : `  ✓ ${name}`)
  }
  console.log(failed ? `\n  ${failed} de ${files.size} com problemas.\n` : `\n  Tudo certo (${files.size}).\n`)
  return failed
}
