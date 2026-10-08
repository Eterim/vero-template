import { Customer } from "@veroao/invoice"

export default function Example() {
  return (
    <Customer
      label="Facturar a"
      className="w-1/2 rounded-md border border-zinc-200 bg-zinc-50 p-4"
      labelClassName="text-[8px] font-bold uppercase tracking-wider text-sky-700"
      nameClassName="text-sm font-bold"
    />
  )
}
