import { DocumentTitle, Spacer, Customer } from "@veroao/invoice"

export default function Example() {
  return (
    <>
      <DocumentTitle className="text-2xl font-bold" />
      <Spacer className="h-12" />
      <Customer />
    </>
  )
}
