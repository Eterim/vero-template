import { Column, DocumentTitle, DocumentNumber, DocumentDate } from "@veroao/invoice"

export default function Example() {
  return (
    <Column className="items-end gap-1">
      <DocumentTitle className="text-3xl font-bold" />
      <DocumentNumber className="font-semibold" />
      <DocumentDate className="text-zinc-500" />
    </Column>
  )
}
