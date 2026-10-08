import { ArrowRight } from 'lucide-react'
import { CopyCommand } from '../components/CopyCommand'

// Facturas dos modelos, em leque 3D. A primeira fica à frente.
const FAN = ['vero-moderno', 'azul', 'vero-classico', 'terracota', 'minimal', 'vero-simples']

function InvoiceFan() {
  return (
    <div aria-hidden className="pointer-events-none relative h-full w-full [perspective:2000px]">
      {/* brilho atrás do leque */}
      <div className="absolute top-[45%] left-[40%] h-[60%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/25 blur-[120px]" />
      <div className="absolute inset-0 animate-float [transform-style:preserve-3d]">
        {FAN.map((id, i) => (
          <img key={id} src={`/previews/${id}.webp`} alt="" width={900} height={1272}
            loading={i < 2 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'}
            className="absolute top-[8%] left-[6%] w-[46%] rounded-[3px] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_50px_90px_-10px_rgba(0,0,0,.9)]"
            style={{
              transform: `translateX(${i * 30}%) translateZ(${-i * 170}px) rotateY(-32deg) rotateX(9deg) rotateZ(-2deg)`,
              zIndex: FAN.length - i,
              filter: i === 0 ? undefined : `brightness(${1 - i * 0.12})`,
            }} />
        ))}
      </div>
      {/* em baixo, as folhas desaparecem no escuro */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/70 to-transparent" />
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_75%_10%,rgba(14,165,233,.14),transparent_65%)]" />
      {/* Computador: o leque fica por trás, à direita, e sai pela margem do ecrã. */}
      <div className="absolute top-0 right-[-14%] hidden h-full w-[66%] lg:block"><InvoiceFan /></div>
      <div className="relative mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:min-h-[760px] lg:pt-24">
        <div className="max-w-[640px] animate-fade-up">
          {/* ícone do Vero em tile, como o do React Email */}
          <span className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_10px_30px_-10px_rgba(14,165,233,.5)]">
            <img src="/vero-white.png" alt="" width={132} height={96} className="h-6 w-auto" />
          </span>
          <h1 className="mt-8 text-[2.7rem] leading-[0.95] font-black tracking-tighter text-balance sm:text-[4rem]">
            Cansado da factura de sempre?{' '}
            <span className="bg-gradient-to-r from-zinc-500 to-zinc-300 bg-clip-text text-transparent">Desenha a tua.</span>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-pretty text-zinc-400">
            Cria o modelo das tuas facturas em React e Tailwind CSS e usa-o no Vero.
            As cores, as letras e a disposição são tuas - a certificação e as regras da AGT ficam por nossa conta.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#componentes" className="inline-flex h-11 items-center justify-center gap-2 bg-white px-5 text-sm font-black text-black transition-colors hover:bg-zinc-200">
              Explorar componentes <ArrowRight className="size-4" />
            </a>
            <CopyCommand command="npx @veroao/invoice dev" />
          </div>
          <p className="mt-4 font-mono text-[11px] text-zinc-600">// a pré-visualização ao vivo (dev) chega na 0.2 · já disponível: npm install @veroao/invoice</p>
        </div>
      </div>
      {/* Telemóvel e tablet: o leque por baixo do texto. */}
      <div className="relative -mt-4 h-[420px] w-[130%] sm:h-[560px] lg:hidden"><InvoiceFan /></div>
    </section>
  )
}
