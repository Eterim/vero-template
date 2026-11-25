import {
  Tailwind, Document, Header, Footer, Row, Column, Text, Logo, DocumentTitle,
  DocumentNumber, DocumentDate, Issuer, Customer, Payment, Items, Totals,
  Notes, AmountInWords, BankAccounts, LegalNotes, PageNumber, CopyLabel,
} from "@veroao/invoice"

// Faixa escura no topo com o título serifado e um filete dourado; o resto em branco.
const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#18181B",
        muted: "#71717A",
        ink: "#18181B",
        gold: "#B08D57",
        line: "#E4E4E7",
        soft: "#FAFAF9",
      },
      fontFamily: { sans: ["Inter"], display: ["Playfair Display"] },
    },
  },
}

const label = "text-[9px] font-bold uppercase tracking-[1px] text-gold mb-[5px]"

export default function Executivo() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[54px] pt-[30px]">
        <Header className="bg-ink px-[54px] py-[30px] border-b-4 border-gold">
          <Row className="items-center justify-between">
            <Column className="gap-[4px]">
              <DocumentTitle className="font-display text-[30px] text-[#FFFFFF]" />
              <DocumentNumber className="text-[12px] text-[#D4D4D8]" />
            </Column>
            <Column className="gap-[4px] items-end">
              <Logo className="h-[42px]" fallbackClassName="font-display text-[20px] text-gold" />
              <DocumentDate className="text-[10.5px] text-[#D4D4D8]" />
              <CopyLabel className="text-[9px] font-bold uppercase tracking-[1.5px] text-gold" />
            </Column>
          </Row>
        </Header>

        <Row className="mb-[26px] gap-[30px]">
          <Issuer label="De" className="flex-1 text-[10px] gap-[2px]" labelClassName={label} nameClassName="text-[12px] font-bold" />
          <Customer label="Para" className="flex-1 text-[10px] gap-[2px]" labelClassName={label} nameClassName="text-[12px] font-bold" />
        </Row>

        <Items
          className="text-[10px]"
          headerClassName="text-[9px] font-bold uppercase tracking-[0.6px] text-muted py-[8px] border-b-2 border-ink"
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
            className="flex-1 text-[10px] bg-soft p-[18px]"
            titleClassName={label}
            ruleClassName="border-gold"
            totalClassName="font-display text-[20px] font-bold"
          />
        </Row>

        <LegalNotes className="text-[9.5px] leading-[1.35] text-muted mt-[22px] gap-[3px]" />

        <Footer className="bg-ink px-[54px] justify-center h-[38px]">
          <Row className="justify-between">
            <Text className="text-[9.5px] text-[#D4D4D8]">{"{{org.name}} · {{org.website}}"}</Text>
            <PageNumber className="text-[9.5px] font-bold text-gold" />
          </Row>
        </Footer>
      </Document>
    </Tailwind>
  )
}
