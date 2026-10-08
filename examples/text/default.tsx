import { Column, Text } from "@veroao/invoice"

export default function Example() {
  return (
    <Column className="gap-1">
      <Text className="text-lg font-bold">Obrigado pela preferência, {"{{customer.name}}"}</Text>
      <Text className="text-zinc-500">Visite-nos em {"{{org.website}}"} · Referência {"{{document.reference}}"}</Text>
    </Column>
  )
}
