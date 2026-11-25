import {
  Tailwind, Document, Row, Column, Text, Logo, DocumentTitle, DocumentNumber,
  DocumentDate, Atcud, Issuer, Customer, Payment, Items, Totals, Notes,
  AmountInWords, BankAccounts, LegalNotes, CopyLabel,
} from "@veroao/invoice"

// Tudo em caixas com contorno, como os livros de facturas em papel.
const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#111111",
        muted: "#555555",
        line: "#111111",
        head: "#EEEEEE",
      },
      fontFamily: { sans: ["Helvetica"] },
    },
  },
}

const box = "border border-line p-[9px] gap-[2px]"
const label = "text-[8.5px] font-bold uppercase text-muted mb-[3px]"

export default function Grelha() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[44px] pt-[38px]">
        <Row className="mb-[10px] gap-[10px] items-center">
          <Column className={`${box} flex-[1.3] justify-center`}>
            <Logo className="h-[46px]" fallbackClassName="text-[18px] font-bold" />
          </Column>
          <Column className={`${box} flex-1 items-center justify-center bg-head`}>
            <DocumentTitle className="text-[17px] font-bold uppercase text-center" />
            <CopyLabel className="text-[9px] font-bold uppercase tracking-[1.5px]" />
          </Column>
        </Row>

        <Row className="mb-[10px] gap-[10px]">
          <Issuer label="Emitente" className={`${box} flex-1 text-[10px]`} labelClassName={label} nameClassName="text-[11px] font-bold" />
          <Customer label="Cliente" className={`${box} flex-1 text-[10px]`} labelClassName={label} nameClassName="text-[11px] font-bold" />
        </Row>

        <Row className="mb-[12px] gap-[10px]">
          <Column className={`${box} flex-1`}>
            <Text className={label}>Número</Text>
            <DocumentNumber className="text-[10.5px] font-bold" />
          </Column>
          <Column className={`${box} flex-1`}>
            <Text className={label}>Data de emissão</Text>
            <DocumentDate className="text-[10.5px]" />
          </Column>
          <Column className={`${box} flex-1 justify-center`}>
            <Atcud prefix="ATCUD:" className="text-[10.5px]" />
          </Column>
        </Row>

        <Items
          className="text-[10px]"
          headerClassName="text-[9px] font-bold uppercase bg-head"
          gridClassName="border border-line"
          detailsClassName="text-[9.5px] text-muted"
          showCurrency={false}
        />

        <Row className="mt-[12px] gap-[10px] items-start">
          <Column className="gap-[10px] flex-[1.2]">
            <Column className={box}>
              <AmountInWords label="Por extenso" labelClassName={label} className="text-[10px]" />
            </Column>
            <Notes label="Observações" className={`${box} text-[10px]`} labelClassName={label} />
            <Payment label="Pagamento" className={`${box} text-[10px]`} labelClassName={label} />
          </Column>
          <Totals
            className="flex-1 text-[10px] border border-line px-[9px]"
            totalLabel="Total (Kz)"
            showCurrency={false}
            rowClassName="border-b border-line"
            totalRowClassName="bg-head"
            totalClassName="text-[12px] font-bold"
          />
        </Row>

        <BankAccounts
          label="Dados bancários"
          layout="table"
          className="text-[10px] mt-[12px]"
          labelClassName={label}
          headerClassName="text-[9px] font-bold uppercase bg-head"
          gridClassName="border border-line"
        />
        <LegalNotes parts={["exemptions", "legal"]} className="text-[9.5px] text-muted mt-[10px] gap-[2px]" />
      </Document>
    </Tailwind>
  )
}
