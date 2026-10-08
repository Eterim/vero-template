import { Row, Customer, Issuer } from "@veroao/invoice"

export default function Example() {
  return (
    <Row className="gap-6">
      <Issuer label="De" className="flex-1 border-l-2 border-zinc-900 pl-3" />
      <Customer label="Para" className="flex-1 border-l-2 border-sky-600 pl-3" />
    </Row>
  )
}
