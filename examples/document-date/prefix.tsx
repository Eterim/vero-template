import { DocumentDate } from "@veroao/invoice"

export default function Example() {
  return <DocumentDate prefix="Emitida em " withTime={false} className="text-base text-zinc-600" />
}
