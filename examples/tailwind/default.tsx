import { Tailwind, Document, Row, DocumentTitle, DocumentNumber, Text } from "@veroao/invoice"

export const page = true

const config = {
  theme: {
    extend: {
      colors: { brand: "#0E4C63", "brand-light": "#E6F0F3" },
      fontFamily: { display: ["Playfair Display"] },
    },
  },
}

export default function Example() {
  return (
    <Tailwind config={config}>
      <Document className="bg-white px-12 pt-10 text-[11px]">
        <Row className="items-end justify-between rounded-md bg-brand-light p-5">
          <DocumentTitle className="font-display text-4xl text-brand" />
          <DocumentNumber className="font-bold text-brand" />
        </Row>
        <Text className="mt-3 text-zinc-500">As cores do config usam-se como no Tailwind: text-brand, bg-brand-light.</Text>
      </Document>
    </Tailwind>
  )
}
