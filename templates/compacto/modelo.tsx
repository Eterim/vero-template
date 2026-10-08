import {
  Tailwind, Document, Row, Column, Logo, DocumentTitle, DocumentNumber,
  DocumentDate, Issuer, Customer, Payment, Items, Totals, Notes,
  AmountInWords, BankAccounts, LegalNotes,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        muted: "#525252",
        surface: "#F5F5F5",
        line: "#D4D4D4",
      },
      fontFamily: {
        sans: ["Helvetica"],
      },
    },
  },
}

// Estilos usados em vários sítios
const label = "text-[8.5px] font-bold uppercase text-muted mb-[3px]"
const tableHeader = "text-[8.5px] font-bold uppercase bg-surface px-[5px] py-[5px]"
const tableRow = "px-[5px] py-[5px] border-b-[0.5px] border-line"
const details = "text-[8.5px] text-muted"

export default function Compact() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[37px] pt-[35px]">
        <Row className="py-2 mb-[13px] border-b-[1.25px] border-foreground items-start justify-between">
          <Logo className="h-[37px]" fallbackClassName="text-base font-bold" />
          <Column className="gap-[1px] items-end">
            <DocumentTitle className="text-[17.5px] font-bold uppercase" />
            <DocumentNumber className="text-[11.5px] font-bold" />
            <DocumentDate className="text-[10px]" />
          </Column>
        </Row>
        <Row className="text-[10px] mb-[13px] gap-4">
          <Issuer label="Emitente" className="flex-1" labelClassName={label} />
          <Customer label="Cliente" className="flex-1" labelClassName={label} />
          <Payment label="Pagamento" className="flex-1" labelClassName={label} />
        </Row>
        <Items
          className="text-[10px]"
          headerClassName={tableHeader}
          rowClassName={tableRow}
          detailsClassName={details}
        />
        <Row className="text-[10px] mt-[11px] gap-[21px]">
          <Column className="gap-2 flex-1">
            <AmountInWords labelClassName={label} />
            <Notes labelClassName={label} />
            <BankAccounts labelClassName={label} headerClassName={tableHeader} />
          </Column>
          <Totals
            className="flex-1"
            titleClassName={label}
            totalClassName="text-[14.5px] font-bold"
            ruleClassName="border-foreground"
          />
        </Row>
        <LegalNotes className="text-[9.5px] leading-[1.35] text-muted mt-[13px] gap-[3px]" />
      </Document>
    </Tailwind>
  )
}
