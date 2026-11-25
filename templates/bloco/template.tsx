import {
  Tailwind, Document, Row, Column, Text, Logo, DocumentTitle, DocumentNumber,
  DocumentDate, Issuer, Customer, Payment, Items, Totals, Notes,
  AmountInWords, BankAccounts, LegalNotes, PageNumber, CopyLabel, StatusBadge,
} from "@veroao/invoice"

// Número grande, contraste forte e o total numa caixa preta.
const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#0A0A0A",
        muted: "#737373",
        accent: "#2563EB",
        dark: "#0A0A0A",
        line: "#E5E5E5",
        soft: "#F5F5F5",
      },
      fontFamily: { sans: ["Inter"] },
    },
  },
}

const label = "text-[9px] font-bold uppercase tracking-[1px] text-muted mb-[4px]"

export default function Bloco() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[50px] pt-[44px]">
        <Row className="mb-[8px] items-center justify-between">
          <Logo className="h-[38px]" fallbackClassName="text-[17px] font-bold" />
          <Row className="gap-[10px] items-center">
            <StatusBadge className="text-[9px] font-bold uppercase text-[#FFFFFF] bg-accent px-[8px] py-[4px] rounded-[3px]" />
            <CopyLabel className="text-[9px] font-bold uppercase tracking-[1.5px] px-[8px] py-[4px] border border-dark rounded-[3px]" />
          </Row>
        </Row>

        <Column className="mb-[24px] gap-[2px]">
          <DocumentTitle className="text-[13px] font-bold uppercase tracking-[1px] text-accent" />
          <DocumentNumber className="text-[30px] font-bold" />
          <DocumentDate prefix="Emitida em" className="text-[10.5px] text-muted" />
        </Column>

        <Row className="mb-[26px] gap-[14px]">
          <Issuer label="De" className="flex-1 border border-line rounded-[6px] p-[14px] gap-[2px] text-[10px]" labelClassName={label} nameClassName="text-[11.5px] font-bold" />
          <Customer label="Para" className="flex-1 border border-line rounded-[6px] p-[14px] gap-[2px] text-[10px]" labelClassName={label} nameClassName="text-[11.5px] font-bold" />
        </Row>

        <Items
          className="text-[10px]"
          headerClassName="text-[9px] font-bold uppercase text-muted bg-soft px-[10px] py-[8px]"
          rowClassName="px-[10px] py-[9px] border-b border-line"
          detailsClassName="text-[9.5px] text-muted mt-[2px]"
        />

        <Row className="mt-[24px] gap-[30px] items-start">
          <Column className="gap-[12px] flex-1">
            <AmountInWords labelClassName={label} className="text-[10px]" />
            <Notes labelClassName={label} className="text-[10px] text-muted" />
            <Payment labelClassName={label} className="text-[10px]" />
            <BankAccounts labelClassName={label} className="text-[10px]" />
          </Column>
          <Totals
            className="flex-1 text-[10px] bg-dark text-[#FFFFFF] rounded-[6px] p-[18px]"
            ruleClassName="border-[#525252]"
            totalClassName="text-[22px] font-bold"
          />
        </Row>

        <LegalNotes className="text-[9.5px] leading-[1.35] text-muted mt-[22px] gap-[3px]" />
        <Row className="mt-[12px] justify-between">
          <Text className="text-[9px] text-muted">{"{{org.name}} · {{org.website}}"}</Text>
          <PageNumber className="text-[9px] text-muted" />
        </Row>
      </Document>
    </Tailwind>
  )
}
