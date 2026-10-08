import { DocumentTitle, Hr, Customer } from "@veroao/invoice"

export default function Example() {
  return (
    <>
      <DocumentTitle className="text-2xl font-bold" />
      <Hr className="my-4 border-t-2 border-zinc-900" />
      <Customer />
    </>
  )
}
