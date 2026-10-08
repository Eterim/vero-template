import {
  Tailwind, Document, Header, Row, Column, Logo, DocumentTitle,
  DocumentNumber, DocumentDate, Issuer, Customer, Payment, Items, Totals,
  Notes, AmountInWords, BankAccounts, LegalNotes,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#0F172A",
        muted: "#64748B",
        brand: "#1D4ED8",
        "brand-light": "#EFF6FF",
        line: "#E2E8F0",
      },
      fontFamily: {
        sans: ["Inter"],
      },
    },
  },
}

// Estilos usados em vários sítios
const label = "text-[9.5px] font-bold uppercase tracking-[0.75px] text-brand mb-[7px]"
const tableHeader = "text-[10px] font-bold text-[#ffffff] bg-brand px-4 py-[11px] rounded-[8px]"
const tableRow = "px-4 py-3 border-b-[0.75px] border-line"
const details = "text-[10px] text-muted mt-[3px]"
const card = "bg-brand-light p-[19px] gap-[3px] rounded-[13px]"

export default function Blue() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[53px] pt-[35px]">
        <Header className="bg-brand px-[53px] py-[35px]">
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
          <Issuer label="De" className={`${card} flex-1`} labelClassName={label} />
          <Customer label="Para" className={`${card} flex-1`} labelClassName={label} />
          <Payment label="Pagamento" className={`${card} flex-1`} labelClassName={label} />
        </Row>
        <Items
          headerClassName={tableHeader}
          rowClassName={tableRow}
          detailsClassName={details}
        />
        <Row className="mt-6 gap-8">
          <Column className="gap-[13px] flex-1">
            <AmountInWords className="gap-[3px]" labelClassName={label} />
            <Notes className="text-muted" labelClassName={label} />
            <BankAccounts
              className="gap-[3px]"
              labelClassName={label}
              headerClassName={tableHeader}
            />
          </Column>
          <Totals
            className={`${card} flex-1`}
            titleClassName={label}
            totalClassName="text-[22.5px] font-bold text-brand"
            ruleClassName="border-brand"
          />
        </Row>
        <LegalNotes className="text-[9.5px] leading-[1.35] text-muted mt-6 gap-[3px]" />
      </Document>
    </Tailwind>
  )
}
