import {
  Tailwind, Document, Footer, Row, Column, Text, Logo, DocumentTitle,
  DocumentNumber, DocumentDate, Issuer, Customer, Payment, Items, Totals,
  Notes, AmountInWords, BankAccounts, LegalNotes, PageNumber,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFBF5",
        foreground: "#292524",
        muted: "#78716C",
        brand: "#9A3412",
        sand: "#F3E5D3",
        line: "#E7D8C6",
      },
      fontFamily: {
        sans: ["Inter"],
        display: ["Playfair Display"],
      },
    },
  },
}

// Estilos usados em vários sítios
const label = "text-[9.5px] font-bold uppercase tracking-[0.75px] text-brand mb-[7px]"
const tableHeader = "text-[9.5px] font-bold uppercase text-brand px-[13px] py-[11px] border-b-2 border-brand"
const tableRow = "px-[13px] py-3 border-b-[0.75px] border-line"
const details = "text-[10px] text-muted mt-[3px]"
const accentBorder = "px-4 gap-[3px] border-l-4 border-brand"

export default function Terracotta() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[61px] pt-[59px]">
        <Row className="mb-[37px] items-end justify-between">
          <Column className="gap-[5px]">
            <DocumentTitle className="font-display text-[37.5px]" />
            <DocumentNumber className="text-[12.5px] text-muted" />
          </Column>
          <Column className="gap-[5px] items-end">
            <Logo className="h-[45px]" fallbackClassName="font-display text-[21.5px] text-brand" />
            <DocumentDate className="text-[11.5px] text-muted" />
          </Column>
        </Row>
        <Row className="mb-[35px] gap-8">
          <Issuer label="Emitente" className={`${accentBorder} flex-1`} labelClassName={label} />
          <Customer label="Cliente" className={`${accentBorder} flex-1`} labelClassName={label} />
        </Row>
        <Items
          headerClassName={tableHeader}
          rowClassName={tableRow}
          detailsClassName={details}
        />
        <Row className="mt-[27px] gap-[37px]">
          <Column className="gap-[13px] flex-1">
            <AmountInWords labelClassName={label} />
            <Notes className="text-muted" labelClassName={label} />
            <Payment labelClassName={label} />
            <BankAccounts labelClassName={label} headerClassName={tableHeader} />
          </Column>
          <Totals
            className="bg-sand p-[21px] rounded-[5px] flex-1"
            titleClassName={label}
            totalClassName="text-[22.5px] font-bold text-brand"
            ruleClassName="border-brand"
          />
        </Row>
        <LegalNotes className="text-[9.5px] leading-[1.35] text-muted mt-6 gap-[3px]" />
        <Footer className="bg-brand px-[61px] justify-center h-[45px]">
          <Row className="justify-between">
            <Text className="text-[10px] text-[#ffffff]">{"{{org.name}} · {{org.website}}"}</Text>
            <PageNumber className="text-[10px] font-bold text-[#ffffff]" />
          </Row>
        </Footer>
      </Document>
    </Tailwind>
  )
}
