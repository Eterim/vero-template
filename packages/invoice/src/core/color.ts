/** Contraste WCAG entre duas cores hex. 4,5 é o mínimo para texto normal. */
export const MIN_FISCAL_CONTRAST = 4.5

function channel(c: number) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

export function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/** A cor pedida se tiver contraste suficiente; senão a primeira de `fallbacks` (ou preto/branco) que se leia. */
export function legible(color: string, background: string, fallbacks: string[]): { color: string; adjusted: boolean } {
  if (contrast(color, background) >= MIN_FISCAL_CONTRAST) return { color, adjusted: false }
  // Primeiro uma cor do tema que se leia; só depois preto ou branco.
  const candidates = [...fallbacks, '#000000', '#FFFFFF']
  const ok = candidates.find((c) => contrast(c, background) >= MIN_FISCAL_CONTRAST)
  return { color: ok ?? '#000000', adjusted: true }
}
