/**
 * Âmbito de um pull request: que templates mudaram e se quem o abriu pode mexer neles.
 * Corre ANTES de instalar ou executar qualquer código do PR (só git e Node).
 *
 * Quem não é da equipa (PR_ASSOCIATION fora de OWNER/MEMBER/COLLABORATOR):
 *   - só mexe em templates/<nome>/, e num só template por PR;
 *   - não apaga templates e só altera os que são seus (author.name = utilizador do GitHub).
 * Para todos: alterar o template.json de um template existente obriga a subir a "version"
 * (o Vero prende cada documento emitido a uma versão).
 *
 * Saída (GITHUB_OUTPUT): templates=<nomes separados por espaço>
 */
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

const { BASE_SHA, HEAD_SHA, PR_AUTHOR = '', PR_ASSOCIATION = '', GITHUB_OUTPUT, GITHUB_STEP_SUMMARY } = process.env
const maintainer = ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(PR_ASSOCIATION)
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const show = (sha, path) => { try { return git('show', `${sha}:${path}`) } catch { return undefined } }
const json = (s) => { try { return s === undefined ? undefined : JSON.parse(s) } catch { return undefined } }

const changes = git('diff', '--name-status', '--no-renames', '-z', `${BASE_SHA}...${HEAD_SHA}`)
  .split('\0').filter(Boolean)
  .reduce((acc, v, i, arr) => (i % 2 === 0 ? [...acc, { status: v, path: arr[i + 1] }] : acc), [])

const problems = []
const slugs = new Set()
for (const { status, path } of changes) {
  const m = /^templates\/([^/]+)\/[^/]+$/.exec(path)
  if (m) slugs.add(m[1])
  else if (!maintainer) problems.push(`\`${path}\`: só a equipa altera ficheiros fora de \`templates/<nome>/\``)
  if (m && status === 'D' && !maintainer) problems.push(`\`${path}\`: só a equipa apaga ficheiros de templates`)
}
if (!maintainer && slugs.size > 1) problems.push(`um template por pull request (este mexe em ${[...slugs].join(', ')})`)

for (const slug of slugs) {
  const before = json(show(BASE_SHA, `templates/${slug}/meta.json`))
  const after = json(show(HEAD_SHA, `templates/${slug}/meta.json`))
  if (!before) continue // template novo
  if (!maintainer && String(before.author?.name ?? '').toLowerCase() !== PR_AUTHOR.toLowerCase()) {
    problems.push(`\`${slug}\` é de @${before.author?.name} - só o autor ou a equipa o alteram`)
  }
  const jsonBefore = show(BASE_SHA, `templates/${slug}/template.json`)
  const jsonAfter = show(HEAD_SHA, `templates/${slug}/template.json`)
  if (after && jsonAfter !== undefined && jsonAfter !== jsonBefore && !(after.version > before.version)) {
    problems.push(`\`${slug}\`: o template mudou - suba "version" no meta.json (era ${before.version})`)
  }
}

const list = [...slugs].join(' ')
if (GITHUB_OUTPUT) appendFileSync(GITHUB_OUTPUT, `templates=${list}\n`)
const summary = ['## Âmbito do pull request', '', `Autor: @${PR_AUTHOR}${maintainer ? ' (equipa)' : ''}`, `Templates: ${list || 'nenhum'}`, '',
  ...(problems.length ? ['### Problemas', ...problems.map((p) => `- ${p}`)] : ['Sem problemas.'])]
if (GITHUB_STEP_SUMMARY) appendFileSync(GITHUB_STEP_SUMMARY, summary.join('\n') + '\n')
console.log(summary.join('\n'))
process.exit(problems.length ? 1 : 0)
