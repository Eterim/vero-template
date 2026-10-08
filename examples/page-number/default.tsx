import { Row, DocumentNumber, PageNumber } from "@veroao/invoice"

export default function Example() {
  return (
    <Row className="justify-between text-zinc-500">
      <DocumentNumber />
      <PageNumber className="font-bold" />
    </Row>
  )
}
