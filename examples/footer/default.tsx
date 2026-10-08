import { Document, Footer, Row, Text, PageNumber, DocumentTitle } from "@veroao/invoice"

export const page = true

export default function Example() {
  return (
    <Document className="bg-white px-12 pt-10 text-[11px]">
      <DocumentTitle className="text-2xl font-bold" />
      <Footer className="h-12 bg-zinc-100 px-12">
        <Row className="h-12 items-center justify-between text-[8px] text-zinc-500">
          <Text>{"{{org.name}} · {{org.website}}"}</Text>
          <PageNumber />
        </Row>
      </Footer>
    </Document>
  )
}
