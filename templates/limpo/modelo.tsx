import {
  Tailwind, Document, Row, Column, Spacer, Logo, DocumentTitle,
  DocumentNumber, DocumentDate, Issuer, Customer, Payment, Items, Totals,
  Notes, AmountInWords, BankAccounts, LegalNotes,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        "fundo": "#FFFFFF",
        "texto": "#18181B",
        "texto-suave": "#71717A",
        "destaque": "#18181B",
        "fundo-suave": "#F4F4F5",
        "linhas": "#E4E4E7",
      },
      fontFamily: {
        sans: ["Inter"],
      },
    },
  },
}

// Estilos usados em vários sítios
const rotulo = "text-[9.5px] font-bold uppercase tracking-[0.75px] text-texto-suave mb-[7px]"
const cabecalhoTabela = "text-[9.5px] font-bold uppercase text-texto-suave px-[11px] py-[9px] border-b-[1.25px] border-texto"
const linhaTabela = "px-[11px] py-[11px] border-b-[0.75px] border-linhas"
const detalhe = "text-[10px] text-texto-suave mt-[3px]"

export default function Limpo() {
  return (
    <Tailwind config={config}>
      <Document className="bg-fundo font-sans text-texto px-[59px] pt-[53px]">
        <Row className="mb-[37px] items-start justify-between">
          <Logo className="h-[48px]" fallbackClassName="text-2xl font-bold" />
          <Column className="gap-1 items-end">
            <DocumentTitle className="text-[26.5px] font-bold" />
            <DocumentNumber className="text-[13.5px]" />
            <DocumentDate className="text-[11.5px] text-texto-suave" />
          </Column>
        </Row>
        <Row className="mb-8 gap-[27px]">
          <Issuer label="De" className="gap-[3px] flex-1" />
          <Customer label="Para" className="bg-fundo-suave p-4 gap-[3px] rounded-[8px] flex-1" />
        </Row>
        <Items detailsClassName={detalhe} />
        <Row className="mt-[27px] gap-[37px]">
          <Column className="gap-4 flex-1">
            <AmountInWords className="gap-[3px]" />
            <Notes className="text-texto-suave" />
            <Payment className="gap-[3px]" />
            <BankAccounts className="gap-[3px]" />
          </Column>
          <Totals className="flex-1" totalClassName="text-xl font-bold" ruleClassName="border-texto" />
        </Row>
        <Spacer className="h-[32px]" />
        <Row className="py-4 gap-4 border-t-[0.75px] border-linhas items-end">
          <LegalNotes className="text-[9.5px] text-texto-suave gap-[3px] flex-1" />
        </Row>
      </Document>
    </Tailwind>
  )
}
