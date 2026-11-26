import { Tailwind, Document, Footer, CornerDecoration, Row, Column, Text, Spacer, Hr, Logo, DocumentTitle, DocumentNumber,
  DocumentDate, StatusBadge, Customer, Issuer, Payment, Items, Totals, Notes, AmountInWords, BankAccounts, LegalNotes,
  PageNumber, CopyLabel } from "@veroao/invoice"

// Noite: azul-noite, faixas no canto, rodapé escuro com riscas e um círculo cortado no canto.
const label = "mb-1 text-[7px] font-bold uppercase tracking-wider text-blue"
export default function Noite() {
  return (
    <Tailwind config={{ theme: { extend: { colors: { navy: "#01042D", blue: "#1E40AF", sky: "#3B82F6", ice: "#EEF3FF", mist: "#F7F9FE", line: "#DCE4F5", muted: "#55607A" } } } }}>
      <Document className="bg-white px-12 pt-10 text-[10px] text-navy">
        <CornerDecoration color="#1E58DD" />
        <Footer className="h-[80px] bg-navy">
          <Row className="h-[4px]">
            <Column className="flex-[5] h-[4px] bg-blue" />
            <Column className="flex-[2] h-[4px] bg-sky" />
            <Column className="flex-1 h-[4px] bg-ice" />
          </Row>
          <Row className="pl-12 items-start justify-between">
            <Column className="pt-5">
              <Text className="text-[8px] font-bold tracking-wide text-white">{"{{org.website}}"}</Text>
            </Column>
            <Row className="pr-10 pt-3">
              <Column className="w-[150px] h-[150px] rounded-full border-[18px] border-[#0C1A5E]" />
            </Row>
          </Row>
        </Footer>

        <Row className="items-start justify-between">
          <Logo className="h-12" fallbackClassName="text-2xl font-bold text-navy" />
        </Row>

        <Row className="mt-8 items-end justify-between">
          <Column>
            <DocumentTitle className="text-3xl font-bold uppercase text-navy" />
            <Row className="mt-1 items-center gap-3">
              <DocumentNumber className="text-sm font-bold text-blue" />
              <StatusBadge className="text-[8px] font-bold uppercase text-blue" />
            </Row>
          </Column>
          <Column className="items-end">
            <CopyLabel className="text-[8px] font-bold uppercase tracking-wider text-muted" />
            <DocumentDate className="mt-1 text-muted" withTime />
          </Column>
        </Row>
        <Hr className="mt-4 border-t-2 border-navy" />

        <Row className="mt-5 gap-6">
          <Customer className="flex-1 py-1 pr-4" labelClassName={label} nameClassName="text-base font-bold text-navy" />
          <Issuer className="flex-1 py-1 pl-6 border-l-2 border-sky" labelClassName={label} nameClassName="text-base font-bold text-navy" />
        </Row>

        <Items
          className="mt-6"
          headerClassName="bg-navy px-3 py-2 text-white text-[7px] font-bold uppercase tracking-wider"
          rowClassName="border-b border-line px-3 py-2 even:bg-mist"
          detailsClassName="text-muted text-[8px]"
        />

        <Row className="mt-5 items-start justify-between gap-6">
          <Column className="flex-1">
            <AmountInWords className="text-muted" labelClassName={label} />
            <Payment className="mt-3 rounded-lg border border-line p-3" labelClassName={label} />
            <Notes className="mt-3" labelClassName={label} />
          </Column>
          <Totals
            className="w-1/2 rounded-lg border border-line"
            rowClassName="border-b border-line"
            totalRowClassName="bg-blue text-white"
            totalClassName="text-xl font-bold"
          />
        </Row>

        <Spacer className="h-5" />
        <Row className="items-center gap-3">
          <Column className="w-[28px] h-[3px] bg-sky" />
          <Text className="text-xs font-bold text-navy">Obrigado pela preferência.</Text>
        </Row>
        <BankAccounts className="mt-3" labelClassName={label} />
        <LegalNotes className="mt-4 text-[8px] text-muted" />
        <PageNumber className="mt-2 text-right text-[8px] text-muted" />
      </Document>
    </Tailwind>
  )
}