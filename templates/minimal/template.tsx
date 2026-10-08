import {
  Tailwind, Document, Row, Column, Spacer, DocumentTitle, DocumentNumber,
  DocumentDate, Issuer, Customer, Items, Totals, Notes, AmountInWords,
  BankAccounts, LegalNotes,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#1C1917",
        muted: "#78716C",
        line: "#E7E5E4",
      },
      fontFamily: {
        sans: ["Inter"],
        display: ["Playfair Display"],
      },
    },
  },
}

// Estilos usados em vários sítios
const label = "text-[9.5px] uppercase tracking-[1.5px] text-muted mb-2"
const tableHeader = "text-[9.5px] uppercase tracking-[1.25px] text-muted py-[11px] border-b-[0.75px] border-foreground"
const tableRow = "py-[13px] border-b-[0.75px] border-line"
const details = "text-[10px] text-muted mt-[3px]"

export default function Minimal() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[75px] pt-[75px]">
        <DocumentTitle className="font-display text-[45.5px]" />
        <Row className="mt-2 mb-12 justify-between">
          <DocumentNumber className="text-xs text-muted" />
          <DocumentDate className="text-xs text-muted" />
        </Row>
        <Row className="mb-12 gap-[53px]">
          <Issuer label="De" className="gap-[3px] flex-1" labelClassName={label} />
          <Customer label="Para" className="gap-[3px] flex-1" labelClassName={label} />
        </Row>
        <Items
          headerClassName={tableHeader}
          rowClassName={tableRow}
          detailsClassName={details}
        />
        <Row className="mt-[37px] gap-[53px]">
          <Column className="text-muted gap-4 flex-1">
            <AmountInWords labelClassName={label} />
            <Notes labelClassName={label} />
            <BankAccounts labelClassName={label} headerClassName={tableHeader} />
          </Column>
          <Totals
            className="flex-1"
            titleClassName={label}
            totalClassName="font-display text-[29.5px]"
            ruleClassName="border-foreground"
          />
        </Row>
        <Spacer className="h-[40px]" />
        <LegalNotes className="text-[9.5px] leading-[1.35] text-muted py-[19px] mt-0 gap-[3px] border-t-[0.75px] border-line" />
      </Document>
    </Tailwind>
  )
}
