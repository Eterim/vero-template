import { Row, Customer, Issuer } from "@veroao/invoice"

export default function Example() {
  return (
    <Row className="items-start gap-6">
      <Customer className="flex-1 rounded border border-zinc-200 p-4" />
      <Issuer className="flex-1 p-4" />
    </Row>
  )
}
