import { Row, DocumentNumber, CopyLabel } from "@veroao/invoice"

export default function Example() {
  return (
    <Row className="justify-between items-end">
      <DocumentNumber className="font-bold" />
      <CopyLabel className="text-[9px] font-bold uppercase tracking-[1.5px] text-zinc-500" />
    </Row>
  )
}
