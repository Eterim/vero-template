import {
  Tailwind, Document, Footer, Row, Column, Text, Logo, DocumentTitle,
  DocumentNumber, DocumentDate, Atcud, Issuer, Customer, Items, Totals,
  Notes, BankAccounts, LegalNotes,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#111827",
        muted: "#6B7280",
        secondary: "#374151",
        accent: "#1F3A5F",
        line: "#C8CCD1",
        "line-light": "#E5E7EB",
        surface: "#F3F4F6",
        zebra: "#F9FAFB",
      },
      fontFamily: {
        sans: ["Helvetica"],
      },
    },
  },
}

export default function Simple() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[53px] pt-[13px]">
        <Row className="py-2 mb-[11px] border-b-[1.25px] border-line justify-end">
          <Logo className="flex-1 h-[61px]" fallback="none" />
          <DocumentTitle withCode className="text-[40px] font-bold text-right text-accent" />
        </Row>
        <Row className="mb-[19px] gap-5 items-start">
          <Customer
            label="Contribuinte:"
            className="text-[10.5px] p-[11px] gap-[3px] border border-line flex-[4.9]"
            labelClassName="text-[9.5px] font-bold text-secondary mb-[3px]"
            nameClassName="text-[13.5px] font-bold"
          />
          <Issuer
            label=""
            taxIdLabel="Nº de Contribuinte:"
            className="text-[10.5px] gap-[3px] flex-[5.1]"
            nameClassName="text-[13.5px] font-bold"
          />
        </Row>
        <DocumentNumber
          prefix="{{document.title}} - {{document.type}} nº"
          className="text-[13.5px] font-bold uppercase"
        />
        <Row className="mt-1 mb-4 justify-between">
          <DocumentDate prefix="Data de emissão:" className="text-[10px] text-muted" />
          <Atcud
            prefix="ATCUD (Código Único do Documento):"
            className="text-[10px] text-muted"
          />
        </Row>
        <Items
          className="text-[10.5px]"
          headerClassName="text-[10px] font-bold text-secondary px-2 py-[9px] border-b border-line"
          rowClassName="px-2 py-[11px] border-b-[0.5px] border-line-light"
          showCurrency={false}
          columns={[
            { field: "description", label: "Artigos", width: 3 },
            { field: "quantity", label: "Qtd.", width: 0.8 },
            { field: "unitPrice", label: "Preços", width: 1.5 },
            { field: "details", label: "Descrição", width: 2.9, className: "text-[9.5px] text-secondary" },
            { field: "taxRate", label: "IVA", width: 1.1 },
            { field: "lineTotal", label: "Montante", width: 1 },
          ]}
        />
        <Row className="mt-4">
          <Column className="flex-[5.7]" />
          <Column className="gap-[7px] flex-[4.6]">
            <Text className="text-[10.5px] font-bold text-secondary">Totais do documento (valores em kwanzas)</Text>
            <Totals
              totalLabel="Valor total a pagar"
              byRate={false}
              showCurrency={false}
              className="text-[10.5px] px-[11px] border border-line"
              totalClassName="text-xs font-bold"
              rowClassName="border-b border-line-light"
              totalRowClassName="bg-surface"
            />
          </Column>
        </Row>
        <Column className="text-[10.5px] mt-8 gap-2">
          <Notes label="Mensagem" inline labelClassName="font-bold text-muted" />
        </Column>
        <BankAccounts
          label="Pagamento"
          layout="table"
          className="text-[10.5px] mt-[21px]"
          labelClassName="text-[10.5px] font-bold mb-2"
          headerClassName="text-[9.5px] font-bold text-muted bg-surface"
          gridClassName="border-[0.75px] border-line"
        />
        <LegalNotes
          parts={["exemptions","legal"]}
          className="text-[9.5px] text-muted mt-[13px]"
        />
        <Footer className="px-[53px] py-[13px] justify-end h-[64px]">
          <Row className="text-[9.5px] text-muted py-2 border-t-[0.75px] border-line-light justify-between">
            <LegalNotes parts={["certification"]} />
            <Text>{"{{document.number}}"}</Text>
          </Row>
        </Footer>
      </Document>
    </Tailwind>
  )
}
