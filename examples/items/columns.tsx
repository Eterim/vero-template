import { Items } from "@veroao/invoice"

export default function Example() {
  return (
    <Items
      showCurrency={false}
      columns={[
        { field: "description", label: "Artigo", width: 4 },
        { field: "quantity", label: "Qtd." },
        { field: "unitPrice", label: "Preço" },
        { field: "lineDiscount", label: "Desc." },
        { field: "lineTotal", label: "Total", width: 1.5 },
      ]}
    />
  )
}
