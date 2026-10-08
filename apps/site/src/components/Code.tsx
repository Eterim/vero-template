import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

/**
 * Realce de sintaxe mínimo para TSX - só o que os exemplos do site usam (tags, atributos,
 * texto, comentários, palavras-chave). Sem dependências, para a página carregar depressa.
 */
const KEYWORDS = new Set(['import', 'from', 'export', 'default', 'function', 'return', 'const'])

function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(\{\/\*[\s\S]*?\*\/\}|\/\/[^\n]*)|("[^"]*"|'[^']*')|(<\/?)([A-Z][\w.]*|[a-z][\w-]*)|([a-zA-Z]+)(?==)|(\b[A-Za-z_]\w*\b)|(\/?>)/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index))
    const [all, comment, str, open, tag, attr, word, close] = m
    if (comment) out.push(<span key={k++} className="text-zinc-500 italic">{comment}</span>)
    else if (str) out.push(<span key={k++} className="text-emerald-400">{str}</span>)
    else if (open) {
      out.push(<span key={k++} className="text-zinc-500">{open}</span>)
      out.push(<span key={k++} className={/^[A-Z]/.test(tag) ? 'text-sky-400' : 'text-orange-400'}>{tag}</span>)
    } else if (attr) out.push(<span key={k++} className="text-amber-200">{attr}</span>)
    else if (word && KEYWORDS.has(word)) out.push(<span key={k++} className="text-orange-400">{word}</span>)
    else if (close) out.push(<span key={k++} className="text-zinc-500">{close}</span>)
    else out.push(all)
    last = m.index + all.length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

export function Code({ code, file, className = '', copyable = false }: { code: string; file?: string; className?: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* sem permissão */ }
  }
  return (
    <div className={`overflow-hidden border border-zinc-800 bg-zinc-950 ${className}`}>
      {file && (
        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-red-500/80" />
            <span className="size-2.5 rounded-full bg-amber-400/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </span>
          <span className="ml-2 font-mono text-[11.5px] text-zinc-400">{file}</span>
          {copyable && (
            <button type="button" onClick={copy} className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-zinc-500 transition-colors hover:text-white">
              {copied ? <><Check className="size-3.5 text-emerald-400" /> Copiado</> : <><Copy className="size-3.5" /> Copiar</>}
            </button>
          )}
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.75] text-zinc-300 sm:p-5">
        <code>{highlight(code)}</code>
      </pre>
    </div>
  )
}
