import {
  Tailwind, Document, Row, Column, Spacer, Logo, DocumentTitle,
  DocumentNumber, DocumentDate, Issuer, Customer, Payment, Items, Totals,
  Notes, AmountInWords, BankAccounts, LegalNotes,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#18181B",
        muted: "#71717A",
        accent: "#18181B",
        surface: "#F4F4F5",
        line: "#E4E4E7",
      },
      fontFamily: {
        sans: ["Inter"],
      },
    },
  },
}

// Estilos usados em vários sítios
const label = "text-[9.5px] font-bold uppercase tracking-[0.75px] text-muted mb-[7px]"
const tableHeader = "text-[9.5px] font-bold uppercase text-muted px-[11px] py-[9px] border-b-[1.25px] border-foreground"
const tableRow = "px-[11px] py-[11px] border-b-[0.75px] border-line"
const details = "text-[10px] text-muted mt-[3px]"

export default function Clean() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[59px] pt-[53px]">
        <Row className="mb-[37px] items-start justify-between">
          <Logo className="h-[48px]" fallbackClassName="text-2xl font-bold" />
          <Column className="gap-1 items-end">
            <DocumentTitle className="text-[26.5px] font-bold" />
            <DocumentNumber className="text-[13.5px]" />
            <DocumentDate className="text-[11.5px] text-muted" />
          </Column>
        </Row>
        <Row className="mb-8 gap-[27px]">
          <Issuer label="De" className="gap-[3px] flex-1" labelClassName={label} />
          <Customer
            label="Para"
            className="bg-surface p-4 gap-[3px] rounded-[8px] flex-1"
            labelClassName={label}
          />
        </Row>
        <Items
          headerClassName={tableHeader}
          rowClassName={tableRow}
          detailsClassName={details}
        />
        <Row className="mt-[27px] gap-[37px]">
          <Column className="gap-4 flex-1">
            <AmountInWords className="gap-[3px]" labelClassName={label} />
            <Notes className="text-muted" labelClassName={label} />
            <Payment className="gap-[3px]" labelClassName={label} />
            <BankAccounts
              className="gap-[3px]"
              labelClassName={label}
              headerClassName={tableHeader}
            />
          </Column>
          <Totals
            className="flex-1"
            titleClassName={label}
            totalClassName="text-xl font-bold"
            ruleClassName="border-foreground"
          />
        </Row>
        <Spacer className="h-[32px]" />
        <Row className="py-4 gap-4 border-t-[0.75px] border-line items-end">
          <LegalNotes className="text-[9.5px] text-muted gap-[3px] flex-1" />
        </Row>
      </Document>
    </Tailwind>
  )
}
