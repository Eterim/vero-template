import {
  Tailwind, Document, Row, Column, Spacer, DocumentTitle, DocumentNumber,
  DocumentDate, Issuer, Customer, Items, Totals, Notes, AmountInWords,
  BankAccounts, LegalNotes,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        "fundo": "#FFFFFF",
        "texto": "#1C1917",
        "texto-suave": "#78716C",
        "linhas": "#E7E5E4",
      },
      fontFamily: {
        sans: ["Inter"],
        display: ["Playfair Display"],
      },
    },
  },
}

// Estilos usados em vários sítios
const rotulo = "text-[9.5px] uppercase tracking-[1.5px] text-texto-suave mb-2"
const cabecalhoTabela = "text-[9.5px] uppercase tracking-[1.25px] text-texto-suave py-[11px] border-b-[0.75px] border-texto"
const linhaTabela = "py-[13px] border-b-[0.75px] border-linhas"
const detalhe = "text-[10px] text-texto-suave mt-[3px]"

export default function Minimal() {
  return (
    <Tailwind config={config}>
      <Document className="bg-fundo font-sans text-texto px-[75px] pt-[75px]">
        <DocumentTitle className="font-display text-[45.5px]" />
        <Row className="mt-2 mb-12 justify-between">
          <DocumentNumber className="text-xs text-texto-suave" />
          <DocumentDate className="text-xs text-texto-suave" />
        </Row>
        <Row className="mb-12 gap-[53px]">
          <Issuer label="De" className="gap-[3px] flex-1" />
          <Customer label="Para" className="gap-[3px] flex-1" />
        </Row>
        <Items detailsClassName={detalhe} />
        <Row className="mt-[37px] gap-[53px]">
          <Column className="text-texto-suave gap-4 flex-1">
            <AmountInWords />
            <Notes />
            <BankAccounts />
          </Column>
          <Totals
            className="flex-1"
            totalClassName="font-display text-[29.5px]"
            ruleClassName="border-texto"
          />
        </Row>
        <Spacer className="h-[40px]" />
        <LegalNotes className="text-[9.5px] leading-[1.35] text-texto-suave py-[19px] mt-0 gap-[3px] border-t-[0.75px] border-linhas" />
      </Document>
    </Tailwind>
  )
}
