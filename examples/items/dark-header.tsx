import { Items } from "@veroao/invoice"

export default function Example() {
  return (
    <Items
      headerClassName="bg-zinc-900 px-2 py-2 text-[8px] font-bold uppercase text-white"
      rowClassName="px-2 py-2 even:bg-zinc-50"
    />
  )
}
