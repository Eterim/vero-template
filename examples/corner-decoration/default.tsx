import { Tailwind, Document, CornerDecoration, DocumentTitle, DocumentNumber } from "@veroao/invoice"

export const page = true
export const crop = true

export default function Example() {
  return (
    <Tailwind config={{ theme: { extend: { colors: { accent: "#0E4C63" } } } }}>
      <Document className="bg-white px-12 pt-10 text-[11px]">
        <CornerDecoration color="accent" />
        <DocumentTitle className="mt-6 text-3xl font-bold uppercase text-accent" />
        <DocumentNumber className="mt-1 text-zinc-500" />
      </Document>
    </Tailwind>
  )
}
