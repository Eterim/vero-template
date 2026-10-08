export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <img src={`${import.meta.env.BASE_URL}vero-white.png`} alt="" width={132} height={96} className="h-[22px] w-auto" />
      <span className="text-xl font-black tracking-tighter text-white">Vero</span>
      <span className="ml-0.5 border border-zinc-700 px-1.5 py-px font-mono text-[10px] tracking-wider text-zinc-400 uppercase">Template</span>
    </span>
  )
}

/** Eyebrow das secções, como em vero.ao/developers: ícone + texto em mono. */
export function Eyebrow({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-zinc-500 uppercase">
      <Icon className="size-3.5" /> {children}
    </p>
  )
}
