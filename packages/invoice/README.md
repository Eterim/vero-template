# @veroao/invoice

Angolan invoices, receipts and credit/debit notes in **React** and **Tailwind CSS** - with the AGT (Angolan tax authority) rules built in.
Works without Vero: design the template, pass your data, get a PDF.

[Português](https://github.com/Eterim/vero-template/blob/main/packages/invoice/README.pt.md) · [Docs](https://eterim.github.io/vero-template/docs)

> In development (0.x). The API may change until 1.0. Messages and document labels are in Portuguese, the language of the documents.

```bash
npm install @veroao/invoice react
```

## A template

```tsx
import { Tailwind, Document, Row, Logo, DocumentTitle, DocumentNumber,
  Customer, Issuer, Items, Totals, LegalNotes } from "@veroao/invoice"

export default function MyInvoice() {
  return (
    <Tailwind config={{ theme: { extend: { colors: { brand: "#0E4C63" } } } }}>
      <Document className="bg-white px-12 pt-10 text-[11px]">
        <Row className="items-start justify-between">
          <Logo className="h-12" />
          <DocumentTitle className="text-3xl font-bold uppercase text-brand" />
        </Row>
        <Row className="mt-8 gap-6">
          <Customer className="flex-1 border border-zinc-200 p-3" labelClassName="font-bold text-brand" />
          <Issuer className="flex-1" />
        </Row>
        <DocumentNumber className="mt-6 font-bold" />
        <Items className="mt-3" rowClassName="border-b border-zinc-200 even:bg-zinc-50" />
        <Totals className="ml-auto mt-4 w-1/2" totalClassName="text-xl font-bold text-brand" />
        <LegalNotes className="mt-6 text-[9px] text-zinc-500" />
      </Document>
    </Tailwind>
  )
}
```

## Live preview

```bash
npx @veroao/invoice dev
```

Opens `http://localhost:3200` with the templates in `templates/` or `modelos/` (otherwise the current folder):
every `.tsx` with a `default` export, or `<folder>/<name>/modelo.tsx`. The PDF is redrawn every time you save,
for all five document types (FT, FR, NC, ND, RC). If Tailwind or the code has an error, you see the component
and the reason, and the last good version stays on screen. The **JSON para o Vero** button copies the template
ready to import.

Nothing needs to be installed in your project: React and the library come with the CLI.
Another folder or port: `npx @veroao/invoice dev modelos --port 3300`.

## PDF

```ts
import { render } from "@veroao/invoice"

const { pdf, warnings } = await render(<MyInvoice />, document)   // pdf: Uint8Array
```

`document` (`DocumentData`) carries everything fiscal - number, date, ATCUD, the 4 signature characters,
the number of **your** certified software, the QR URL, company, customer, lines and totals.
The template never contains it. To try it out: `sampleDocument("FT")`.

## Using it in Vero

```ts
import { compile } from "@veroao/invoice"

const template = compile(<MyInvoice />)   // JSON with the look only - this is what Vero imports
```

React runs once, on your side. Vero only receives JSON and never runs third-party code.

## What the library guarantees (AGT)

- The **QR code** is always in the bottom-right corner of the last page.
- Mandatory elements (type, number, date, tax IDs, items, totals, legal notes) are never missing:
  if the template doesn't have them, they are added and reported in `warnings`.
- Fiscal text keeps a minimum **contrast** (4.5) and is never smaller than 7 pt.
- `checkTemplate(json)` rejects templates whose own text looks like fiscal or payment data
  (IBANs, phone numbers, tax IDs, links, e-mails, certification mentions) - that always comes from the document.

## Supported Tailwind

Sizes as on the web (1 px = 0.75 pt; A4 is 794 px wide).

| | |
|---|---|
| Spacing | `p-* px-* py-* pt-* pb-* pl-* pr-* mt-* mb-* ml-* mr-* mx-* my-* gap-*`, `ml-auto` |
| Text | `text-xs…6xl`, `text-[11px]`, `font-normal/semibold/bold`, `font-display`, `uppercase`, `tracking-*`, `leading-*`, `text-left/center/right` |
| Color | Tailwind palette, `config` colors, `text-[#hex]` `bg-[#hex]` `border-[#hex]` |
| Borders | `border`, `border-2`, `border-[0.5px]`, `border-t/b/l/r-*`, `rounded-*` |
| Layout | `flex-1`, `flex-[2]`, `items-*`, `justify-*`, `w-1/2`, `w-full`, `w-[200px]`, `h-*` |
| Variants | `even:` (alternating table rows) |

These don't exist in a PDF and raise an error explaining why: `hover:`, `md:`, `dark:`, shadows, gradients,
transforms, CSS grid and absolute positioning. You can also use `style={{ fontSize: 9 }}` (pt).

## Components

`Tailwind` · `Document` · `Header` · `Footer` · `CornerDecoration` · `Row` · `Column` · `Text` · `Spacer` · `Hr` ·
`Logo` · `DocumentTitle` · `DocumentNumber` · `DocumentDate` · `Atcud` · `StatusBadge` · `Issuer` · `Customer` ·
`Payment` · `Items` · `Totals` · `Notes` · `AmountInWords` · `BankAccounts` · `LegalNotes` · `PageNumber`

Your own components, lists (`.map`) and conditions work. Hooks don't - a template has no state.

Fonts (Inter, Playfair Display) ship with the package under the OFL. MIT licensed.
