import { Document, Header, Row, Logo, DocumentTitle, DocumentNumber, Column } from "@veroao/invoice"

export const page = true
export const crop = true

export default function Example() {
  return (
    <Document className="bg-white px-12 pt-8 text-[11px]">
      <Header className="bg-zinc-900 px-12 py-8">
        <Row className="items-center justify-between">
          <Logo className="h-10" fallbackClassName="text-lg font-bold text-white" />
          <Column className="items-end">
            <DocumentTitle className="text-2xl font-bold uppercase text-white" />
            <DocumentNumber className="text-zinc-400" />
          </Column>
        </Row>
      </Header>
    </Document>
  )
}
