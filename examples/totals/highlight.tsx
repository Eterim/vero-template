import { Totals } from "@veroao/invoice"

export default function Example() {
  return (
    <Totals
      byRate={false}
      className="ml-auto w-1/2"
      rowClassName="border-b border-zinc-200"
      totalRowClassName="bg-zinc-900 text-white"
      totalClassName="text-lg font-bold"
    />
  )
}
