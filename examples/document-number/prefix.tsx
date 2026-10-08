import { DocumentNumber } from "@veroao/invoice"

export default function Example() {
  return <DocumentNumber prefix="{{document.title}} n.º " className="text-lg font-semibold" />
}
