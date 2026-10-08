import { Row, Logo, DocumentTitle } from "@veroao/invoice"

export default function Example() {
  return (
    <Row className="items-center justify-between border-b border-zinc-200 pb-4">
      <Logo className="h-10" />
      <DocumentTitle className="text-2xl font-bold" />
    </Row>
  )
}
