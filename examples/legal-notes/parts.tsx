import { Row, LegalNotes } from "@veroao/invoice"

export default function Example() {
  return (
    <Row className="gap-6 text-[8px] text-zinc-500">
      <LegalNotes parts={["atcud", "exemptions"]} className="flex-1" />
      <LegalNotes parts={["legal"]} className="flex-1 text-right" />
    </Row>
  )
}
