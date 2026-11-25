import {
  Tailwind, Document, Footer, Row, Column, Text, Logo, DocumentTitle,
  DocumentNumber, DocumentDate, Issuer, Customer, Payment, Items, Totals,
  Notes, AmountInWords, BankAccounts, LegalNotes, PageNumber, CopyLabel,
} from "@veroao/invoice"

// Verde-escuro e ocre: filete grosso no topo, tabela com linhas alternadas e o total numa caixa verde.
const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#1C2B22",
        muted: "#5F6B63",
        green: "#1F5135",
        ochre: "#C98A2B",
        mist: "#F2F6F3",
        line: "#DCE5DF",
      },
      fontFamily: { sans: ["Inter"] },
    },
  },
}

const label = "text-[9px] font-bold uppercase tracking-[0.8px] text-ochre mb-[5px]"

export default function Savana() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[52px] pt-[40px]">
        <Row className="pt-[18px] mb-[28px] items-start justify-between border-t-4 border-green">
          <Column className="gap-[4px]">
            <Logo className="h-[44px]" fallbackClassName="text-[20px] font-bold text-green" />
          </Column>
          <Column className="gap-[3px] items-end">
            <DocumentTitle className="text-[26px] font-bold text-green" />
            <DocumentNumber className="text-[11.5px] font-bold" />
            <DocumentDate className="text-[10.5px] text-muted" />
            <CopyLabel className="text-[9px] font-bold uppercase tracking-[1.5px] text-ochre" />
          </Column>
        </Row>

        <Row className="mb-[26px] gap-[16px]">
          <Issuer label="Emitente" className="flex-1 bg-mist p-[14px] gap-[2px] text-[10px]" labelClassName={label} nameClassName="text-[11.5px] font-bold" />
          <Customer label="Cliente" className="flex-1 bg-mist p-[14px] gap-[2px] text-[10px]" labelClassName={label} nameClassName="text-[11.5px] font-bold" />
        </Row>

        <Items
          className="text-[10px]"
          headerClassName="text-[9px] font-bold uppercase text-[#FFFFFF] bg-green px-[10px] py-[8px]"
          rowClassName="px-[10px] py-[8px] even:bg-mist"
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
            className="flex-1 text-[10px]"
            rowClassName="border-b border-line"
            totalRowClassName="bg-green text-[#FFFFFF]"
            totalClassName="text-[15px] font-bold"
          />
        </Row>

        <LegalNotes className="text-[9.5px] leading-[1.35] text-muted mt-[22px] gap-[3px]" />

        <Footer className="px-[52px] justify-center h-[36px] border-t-2 border-ochre">
          <Row className="justify-between">
            <Text className="text-[9.5px] text-muted">{"{{org.name}} · {{org.website}}"}</Text>
            <PageNumber className="text-[9.5px] font-bold text-green" />
          </Row>
        </Footer>
      </Document>
    </Tailwind>
  )
}
