import {
  Tailwind, Document, Header, Row, Column, Logo, DocumentTitle,
  DocumentNumber, DocumentDate, Issuer, Customer, Payment, Items, Totals,
  Notes, AmountInWords, BankAccounts, LegalNotes,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        "fundo": "#FFFFFF",
        "texto": "#0F172A",
        "texto-suave": "#64748B",
        "azul": "#1D4ED8",
        "azul-claro": "#EFF6FF",
        "linhas": "#E2E8F0",
      },
      fontFamily: {
        sans: ["Inter"],
      },
    },
  },
}

// Estilos usados em vários sítios
const rotulo = "text-[9.5px] font-bold uppercase tracking-[0.75px] text-azul mb-[7px]"
const cabecalhoTabela = "text-[10px] font-bold text-[#ffffff] bg-azul px-4 py-[11px] rounded-[8px]"
const linhaTabela = "px-4 py-3 border-b-[0.75px] border-linhas"
const detalhe = "text-[10px] text-texto-suave mt-[3px]"
const cartao = "bg-azul-claro p-[19px] gap-[3px] rounded-[13px]"

export default function Azul() {
  return (
    <Tailwind config={config}>
      <Document className="bg-fundo font-sans text-texto px-[53px] pt-[35px]">
        <Header className="bg-azul px-[53px] py-[35px]">
          <Row className="items-center justify-between">
            <Logo className="h-[48px]" fallbackClassName="text-[26.5px] font-bold text-[#ffffff]" />
            <Column className="gap-1 items-end">
              <DocumentTitle className="text-2xl font-bold text-[#ffffff]" />
              <DocumentNumber className="text-[13.5px] text-[#dbeafe]" />
              <DocumentDate className="text-[10.5px] text-[#dbeafe]" />
            </Column>
          </Row>
        </Header>
        <Row className="mb-[27px] gap-[19px]">
          <Issuer label="De" className={`${cartao} flex-1`} labelClassName={rotulo} />
          <Customer label="Para" className={`${cartao} flex-1`} labelClassName={rotulo} />
          <Payment label="Pagamento" className={`${cartao} flex-1`} labelClassName={rotulo} />
        </Row>
        <Items
          headerClassName={cabecalhoTabela}
          rowClassName={linhaTabela}
          detailsClassName={detalhe}
        />
        <Row className="mt-6 gap-8">
          <Column className="gap-[13px] flex-1">
            <AmountInWords className="gap-[3px]" labelClassName={rotulo} />
            <Notes className="text-texto-suave" labelClassName={rotulo} />
            <BankAccounts
              className="gap-[3px]"
              labelClassName={rotulo}
              headerClassName={cabecalhoTabela}
            />
          </Column>
          <Totals
            className={`${cartao} flex-1`}
            titleClassName={rotulo}
            totalClassName="text-[22.5px] font-bold text-azul"
            ruleClassName="border-azul"
          />
        </Row>
        <LegalNotes className="text-[9.5px] leading-[1.35] text-texto-suave mt-6 gap-[3px]" />
      </Document>
    </Tailwind>
  )
}
