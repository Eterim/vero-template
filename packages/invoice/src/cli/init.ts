/**
 * `npx @veroao/invoice init [pasta]` - cria um projecto pronto a usar: package.json,
 * tsconfig.json e um template de partida em templates/. Não instala nada.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'

export interface InitOptions { dir?: string; version: string }

export function init({ dir = 'vero-invoice', version }: InitOptions): string {
  const root = resolve(dir)
  if (existsSync(root) && readdirSync(root).some((f) => !f.startsWith('.'))) {
    throw new Error(`a pasta ${relative(process.cwd(), root) || '.'} já existe e não está vazia - escolha outra: npx @veroao/invoice init <pasta>`)
  }
  const name = basename(root).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'vero-invoice'
  const files: Record<string, string> = {
    'package.json': JSON.stringify({
      name, private: true, type: 'module',
      scripts: { dev: 'veroao-invoice dev', check: 'veroao-invoice check' },
      dependencies: { '@veroao/invoice': `^${version}`, react: '^19.0.0' },
      devDependencies: { '@types/react': '^19.0.0', typescript: '^5.6.0' },
    }, null, 2) + '\n',
    'tsconfig.json': JSON.stringify({
      compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: true },
      include: ['templates'],
    }, null, 2) + '\n',
    '.gitignore': 'node_modules\n',
    'README.md': README,
    'templates/invoice.tsx': STARTER,
  }
  mkdirSync(join(root, 'templates'), { recursive: true })
  for (const [f, content] of Object.entries(files)) writeFileSync(join(root, f), content)
  return root
}

const README = `# Templates de facturas

Feito com [@veroao/invoice](https://www.npmjs.com/package/@veroao/invoice).

\`\`\`bash
npm install
npm run dev      # pré-visualização ao vivo em http://localhost:3200
npm run check    # as verificações da AGT e de segurança, antes de publicar
\`\`\`

Cada ficheiro \`.tsx\` em \`templates/\` é um template. Documentação: https://template.vero.ao/docs
`

const STARTER = `import {
  Tailwind, Document, Row, Column, Spacer, Logo, DocumentTitle,
  DocumentNumber, DocumentDate, Issuer, Customer, Payment, Items, Totals,
  Notes, AmountInWords, BankAccounts, LegalNotes,
} from "@veroao/invoice"

// As cores e a letra do template. Usa-as nas classes: text-muted, bg-surface, border-line…
const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#18181B",
        muted: "#71717A",
        surface: "#F4F4F5",
        line: "#E4E4E7",
      },
      fontFamily: {
        sans: ["Inter"],
      },
    },
  },
}

// Estilos usados em vários sítios
const label = "text-[9.5px] font-bold uppercase tracking-[0.75px] text-muted mb-[7px]"
const tableHeader = "text-[9.5px] font-bold uppercase text-muted px-[11px] py-[9px] border-b-[1.25px] border-foreground"
const tableRow = "px-[11px] py-[11px] border-b-[0.75px] border-line"

// Números, NIF, ATCUD, totais, menções legais e o QR da AGT vêm dos componentes:
// aqui só se decide onde ficam e com que aspecto.
export default function Invoice() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[59px] pt-[53px]">
        <Row className="mb-[37px] items-start justify-between">
          <Logo className="h-[48px]" fallbackClassName="text-2xl font-bold" />
          <Column className="gap-1 items-end">
            <DocumentTitle className="text-[26.5px] font-bold" />
            <DocumentNumber className="text-[13.5px]" />
            <DocumentDate className="text-[11.5px] text-muted" />
          </Column>
        </Row>
        <Row className="mb-8 gap-[27px]">
          <Issuer label="De" className="gap-[3px] flex-1" labelClassName={label} />
          <Customer label="Para" className="bg-surface p-4 gap-[3px] rounded-[8px] flex-1" labelClassName={label} />
        </Row>
        <Items headerClassName={tableHeader} rowClassName={tableRow} detailsClassName="text-[10px] text-muted mt-[3px]" />
        <Row className="mt-[27px] gap-[37px]">
          <Column className="gap-4 flex-1">
            <AmountInWords className="gap-[3px]" labelClassName={label} />
            <Notes className="text-muted" labelClassName={label} />
            <Payment className="gap-[3px]" labelClassName={label} />
            <BankAccounts className="gap-[3px]" labelClassName={label} headerClassName={tableHeader} />
          </Column>
          <Totals className="flex-1" titleClassName={label} totalClassName="text-xl font-bold" ruleClassName="border-foreground" />
        </Row>
        <Spacer className="h-[32px]" />
        <Row className="py-4 border-t-[0.75px] border-line">
          <LegalNotes className="text-[9.5px] text-muted gap-[3px] flex-1" />
        </Row>
      </Document>
    </Tailwind>
  )
}
`
