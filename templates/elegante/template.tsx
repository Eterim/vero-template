import {
  Tailwind, Document, Row, Column, Text, Logo, DocumentTitle, DocumentNumber,
  DocumentDate, Issuer, Customer, Payment, Items, Totals, Notes,
  AmountInWords, BankAccounts, LegalNotes, PageNumber, CopyLabel,
} from "@veroao/invoice"

// Centrado e serifado, em papel creme, com filetes duplos a separar as partes.
const config = {
  theme: {
    extend: {
      colors: {
        background: "#FBF8F1",
        foreground: "#2B2620",
        muted: "#7A7166",
        rule: "#2B2620",
        line: "#E3DCCD",
      },
      fontFamily: { sans: ["Inter"], display: ["Playfair Display"] },
    },
  },
}

const label = "text-[9px] uppercase tracking-[2px] text-muted mb-[5px]"
const double = "h-[4px] border-t border-b border-rule"

export default function Elegante() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[60px] pt-[46px]">
        <Column className="items-center gap-[6px] mb-[14px]">
          <Logo className="h-[40px]" fallbackClassName="font-display text-[22px]" />
          <DocumentTitle className="font-display text-[28px] text-center" />
          <DocumentNumber className="text-[11px] text-muted text-center" />
          <Row className="gap-[14px] justify-center">
            <DocumentDate className="text-[10px] text-muted" />
            <CopyLabel className="text-[9px] uppercase tracking-[2px] text-muted" />
          </Row>
        </Column>
        <Column className={`${double} mb-[22px]`} />

        <Row className="mb-[24px] gap-[30px]">
          <Issuer label="Emitente" className="flex-1 text-[10px] gap-[2px]" labelClassName={label} nameClassName="font-display text-[13px]" />
          <Customer label="Cliente" className="flex-1 text-[10px] gap-[2px] items-end" labelClassName={label} nameClassName="font-display text-[13px]" />
        </Row>

        <Items
          className="text-[10px]"
          headerClassName="text-[9px] uppercase tracking-[1.5px] text-muted py-[8px] border-b border-rule"
          rowClassName="py-[9px] border-b-[0.75px] border-line"
          detailsClassName="text-[9.5px] text-muted mt-[2px]"
        />

        <Row className="mt-[24px] gap-[34px] items-start">
          <Column className="gap-[12px] flex-1">
            <AmountInWords labelClassName={label} className="text-[10px]" />
            <Notes labelClassName={label} className="text-[10px] text-muted" />
            <Payment labelClassName={label} className="text-[10px]" />
            <BankAccounts labelClassName={label} className="text-[10px]" />
          </Column>
          <Totals
            className="flex-1 text-[10px]"
            titleClassName={label}
            ruleClassName="border-rule"
            totalClassName="font-display text-[19px]"
          />
        </Row>

        <Column className={`${double} mt-[24px] mb-[10px]`} />
        <LegalNotes className="text-[9.5px] leading-[1.35] text-muted gap-[3px]" />
        <Row className="mt-[10px] justify-between">
          <Text className="text-[9px] text-muted">{"{{org.name}}"}</Text>
          <PageNumber className="text-[9px] text-muted" />
        </Row>
      </Document>
    </Tailwind>
  )
}
