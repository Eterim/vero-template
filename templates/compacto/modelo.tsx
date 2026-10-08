import {
  Tailwind, Document, Row, Column, Logo, DocumentTitle, DocumentNumber,
  DocumentDate, Issuer, Customer, Payment, Items, Totals, Notes,
  AmountInWords, BankAccounts, LegalNotes,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        "fundo": "#FFFFFF",
        "texto": "#000000",
        "texto-suave": "#525252",
        "cinzento-claro": "#F5F5F5",
        "linhas": "#D4D4D4",
      },
      fontFamily: {
        sans: ["Helvetica"],
      },
    },
  },
}

// Estilos usados em vários sítios
const rotulo = "text-[8.5px] font-bold uppercase text-texto-suave mb-[3px]"
const cabecalhoTabela = "text-[8.5px] font-bold uppercase bg-cinzento-claro px-[5px] py-[5px]"
const linhaTabela = "px-[5px] py-[5px] border-b-[0.5px] border-linhas"
const detalhe = "text-[8.5px] text-texto-suave"

export default function Compacto() {
  return (
    <Tailwind config={config}>
      <Document className="bg-fundo font-sans text-texto px-[37px] pt-[35px]">
        <Row className="py-2 mb-[13px] border-b-[1.25px] border-texto items-start justify-between">
          <Logo className="h-[37px]" fallbackClassName="text-base font-bold" />
          <Column className="gap-[1px] items-end">
            <DocumentTitle className="text-[17.5px] font-bold uppercase" />
            <DocumentNumber className="text-[11.5px] font-bold" />
            <DocumentDate className="text-[10px]" />
          </Column>
        </Row>
        <Row className="text-[10px] mb-[13px] gap-4">
          <Issuer label="Emitente" className="flex-1" />
          <Customer label="Cliente" className="flex-1" />
          <Payment label="Pagamento" className="flex-1" />
        </Row>
        <Items className="text-[10px]" detailsClassName={detalhe} />
        <Row className="text-[10px] mt-[11px] gap-[21px]">
          <Column className="gap-2 flex-1">
            <AmountInWords />
            <Notes />
            <BankAccounts />
          </Column>
          <Totals
            className="flex-1"
            totalClassName="text-[14.5px] font-bold"
            ruleClassName="border-texto"
          />
        </Row>
        <LegalNotes className="text-[9.5px] leading-[1.35] text-texto-suave mt-[13px] gap-[3px]" />
      </Document>
    </Tailwind>
  )
}
