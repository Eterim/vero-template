import { Row, DocumentTitle, StatusBadge } from "@veroao/invoice"

export const docType = "FT"

export default function Example() {
  return (
    <Row className="items-center gap-4">
      <DocumentTitle className="text-2xl font-bold" />
      <StatusBadge className="rounded bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-800" />
    </Row>
  )
}
