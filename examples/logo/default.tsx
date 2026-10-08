import { Row, Logo, Text } from "@veroao/invoice"

export default function Example() {
  return (
    <Row className="items-center gap-4">
      <Logo className="h-12" fallbackClassName="text-xl font-bold text-zinc-900" />
      <Text className="text-zinc-500">Sem imagem, mostra o nome da empresa.</Text>
    </Row>
  )
}
