import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* sem permissão para a área de transferência - o comando está visível */ }
  }
  return (
    <button type="button" onClick={copy} title="Copiar"
      className="group inline-flex h-11 items-center gap-3 border border-zinc-800 bg-zinc-950 px-4 font-mono text-[13px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white">
      <span className="text-zinc-600">$</span>
      {command}
      {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-zinc-600 group-hover:text-zinc-300" />}
    </button>
  )
}
