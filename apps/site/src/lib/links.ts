export const LINKS = {
  github: 'https://github.com/Eterim/vero-template',
  npm: 'https://www.npmjs.com/package/@veroao/invoice',
  docs: '/docs',
  /** Importação no dashboard do Vero com o template já escolhido (plano Pro). */
  openInVero: (slug: string) => `https://vero.ao/settings?tab=templates&template=${encodeURIComponent(slug)}`,
}
