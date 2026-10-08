import { Document, Row, Logo, DocumentTitle, DocumentNumber, Customer, Issuer, Items, Totals, LegalNotes } from "@veroao/invoice"

export const page = true

export default function Example() {
  return (
    <Document className="bg-[#FAF7F2] px-14 pt-12 text-[11px] text-stone-900">
      <Row className="items-start justify-between">
        <Logo className="h-10" />
        <DocumentTitle className="text-3xl font-bold" />
      </Row>
      <DocumentNumber className="mt-1 text-right text-stone-600" />
      <Row className="mt-8 gap-6">
        <Customer className="flex-1" />
        <Issuer className="flex-1" />
      </Row>
      <Items className="mt-8" />
      <Totals className="ml-auto mt-4 w-1/2" />
      <LegalNotes className="mt-8 text-[8px] text-stone-600" />
    </Document>
  )
}
