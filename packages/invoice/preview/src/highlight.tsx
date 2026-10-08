import type { ReactNode } from 'react'

/**
 * Realce de sintaxe pequeno, sem dependências: TSX (templates) e JSON (o que o Vero importa).
 * Cores iguais às do site (template.vero.ao).
 */

const KEYWORDS = new Set([
  'import', 'from', 'export', 'default', 'function', 'return', 'const', 'let', 'var', 'if', 'else',
  'for', 'of', 'in', 'new', 'as', 'type', 'interface', 'true', 'false', 'null', 'undefined',
])

const TSX = new RegExp([
  /(\{\/\*[\s\S]*?\*\/\}|\/\*[\s\S]*?\*\/|\/\/[^\n]*)/.source, // 1 comentário
  /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/.source, // 2 texto
  /(<\/?)([A-Z][\w.]*|[a-z][\w-]*)/.source, // 3-4 tag
  /([a-zA-Z_][\w]*)(?==)/.source, // 5 atributo
  /(\b\d+(?:\.\d+)?\b)/.source, // 6 número
  /(\b[A-Za-z_]\w*\b)/.source, // 7 palavra
  /(\/?>)/.source, // 8 fecho da tag
].join('|'), 'g')

function tsx(code: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let k = 0
  for (const m of code.matchAll(TSX)) {
    const i = m.index ?? 0
    if (i > last) out.push(code.slice(last, i))
    const [all, comment, str, open, tag, attr, num, word, close] = m
    if (comment) out.push(<span key={k++} className="text-zinc-500 italic">{comment}</span>)
    else if (str) out.push(<span key={k++} className="text-emerald-400">{str}</span>)
    else if (open) {
      out.push(<span key={k++} className="text-zinc-500">{open}</span>)
      out.push(<span key={k++} className={/^[A-Z]/.test(tag) ? 'text-sky-400' : 'text-orange-400'}>{tag}</span>)
    } else if (attr) out.push(<span key={k++} className="text-amber-200">{attr}</span>)
    else if (num) out.push(<span key={k++} className="text-violet-300">{num}</span>)
    else if (word && KEYWORDS.has(word)) out.push(<span key={k++} className="text-orange-400">{word}</span>)
    else if (word && /^[A-Z]/.test(word)) out.push(<span key={k++} className="text-sky-300">{word}</span>)
    else if (close) out.push(<span key={k++} className="text-zinc-500">{close}</span>)
    else out.push(all)
    last = i + all.length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

// "chave": | "texto" | número | true/false/null | pontuação
const JSON_RE = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|\b(true|false|null)\b|([{}[\],])/g

function json(code: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let k = 0
  for (const m of code.matchAll(JSON_RE)) {
    const i = m.index ?? 0
    if (i > last) out.push(code.slice(last, i))
    const [all, str, colon, num, lit, punct] = m
    if (str && colon) {
      out.push(<span key={k++} className="text-sky-300">{str}</span>)
      out.push(<span key={k++} className="text-zinc-500">{colon}</span>)
    } else if (str) out.push(<span key={k++} className="text-emerald-400">{str}</span>)
    else if (num) out.push(<span key={k++} className="text-violet-300">{num}</span>)
    else if (lit) out.push(<span key={k++} className="text-orange-400">{lit}</span>)
    else if (punct) out.push(<span key={k++} className="text-zinc-500">{punct}</span>)
    else out.push(all)
    last = i + all.length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

/** Textos muito grandes ficam sem cor, para a página não ficar lenta. */
const MAX_HIGHLIGHT = 200_000

export function highlight(code: string, lang: 'tsx' | 'json'): ReactNode[] | string {
  if (code.length > MAX_HIGHLIGHT) return code
  return lang === 'json' ? json(code) : tsx(code)
}
