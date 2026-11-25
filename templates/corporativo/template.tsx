import {
  Tailwind, Document, Footer, Row, Column, Text, Logo, DocumentTitle,
  DocumentNumber, DocumentDate, Atcud, Issuer, Customer, Payment, Items,
  Totals, Notes, AmountInWords, BankAccounts, LegalNotes, PageNumber, CopyLabel,
} from "@veroao/invoice"

// Factura de empresa grande: título com filete de cor, dados do emitente em letra pequena,
// faixa com o número e a data, resumo com linhas finas e quadro do IVA.
const config = {
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#1F2937",
        muted: "#6B7280",
        brand: "#7A1F4B",
        line: "#D1D5DB",
        soft: "#F9FAFB",
      },
      fontFamily: { sans: ["Helvetica"] },
    },
  },
}

const label = "text-[9px] font-bold uppercase tracking-[0.6px] text-muted mb-[3px]"
const section = "text-[11px] font-bold text-foreground"

export default function Corporativo() {
  return (
    <Tailwind config={config}>
      <Document className="bg-background font-sans text-foreground px-[50px] pt-[44px]">
        <Row className="mb-[22px] items-start justify-between">
          <Column className="gap-[6px] flex-1">
            <DocumentTitle className="text-[22px] font-bold pb-[6px] border-b-2 border-brand" />
            <Issuer
              label=""
              className="text-[9.5px] gap-[1px] mt-[4px]"
              nameClassName="text-[10px] font-bold"
            />
          </Column>
          <Column className="gap-[6px] items-end flex-1">
            <Logo className="h-[44px]" fallbackClassName="text-[20px] font-bold text-brand" />
            <PageNumber className="text-[9px] text-muted" />
          </Column>
        </Row>

        <Row className="py-[10px] mb-[18px] gap-6 border-t border-b border-line">
          <Column className="flex-1">
            <Text className={label}>Nº do documento</Text>
            <DocumentNumber className="text-[11px] font-bold" />
          </Column>
          <Column className="flex-1">
            <Text className={label}>Data de emissão</Text>
            <DocumentDate className="text-[10.5px]" />
          </Column>
          <Column className="flex-1 items-end">
            <Text className={label}>Via</Text>
            <CopyLabel className="text-[10.5px] font-bold text-brand" />
          </Column>
        </Row>

        <Customer
          label="Cliente"
          taxIdLabel="NIF:"
          className="text-[10px] gap-[2px] mb-[20px]"
          labelClassName={label}
          nameClassName="text-[11.5px] font-bold"
        />

        <Row className="pb-[6px] mb-[2px] justify-between border-b-2 border-brand">
          <Text className={section}>Resumo do documento</Text>
          <Text className={section}>Valor Kz</Text>
        </Row>
        <Items
          className="text-[10px]"
          headerClassName="text-[9px] font-bold py-[7px] border-b border-line"
          rowClassName="py-[7px] border-b-[0.75px] border-line"
          detailsClassName="text-[9.5px] text-muted mt-[2px]"
          showCurrency={false}
          columns={[
            { field: "description", label: "Descrição", width: 3.2 },
            { field: "quantity", label: "Quantidade", width: 1.1 },
            { field: "unitPrice", label: "Preço Unitário", width: 1.4 },
            { field: "lineDiscount", label: "Desconto", width: 1 },
            { field: "taxAmount", label: "IVA", width: 1.1 },
            { field: "lineTotal", label: "Total", width: 1.3 },
          ]}
        />

        <Row className="mt-[18px] gap-[30px] items-start">
          <Column className="gap-[10px] flex-1">
            <AmountInWords label="Extenso:" inline className="text-[9.5px] text-muted" labelClassName="font-bold" />
            <Notes label="Notas:" inline className="text-[9.5px]" labelClassName="font-bold" />
            <Payment label="Pagamento" className="text-[9.5px]" labelClassName={label} />
            <LegalNotes parts={["exemptions", "legal"]} className="text-[9.5px] leading-[1.35] text-muted gap-[2px]" />
          </Column>
          <Totals
            className="text-[10px] flex-1"
            title="Totais do documento"
            titleClassName={section}
            totalLabel="Total a pagar"
            rowClassName="border-b border-line"
            ruleClassName="border-brand"
            totalClassName="text-[12px] font-bold text-brand"
          />
        </Row>

        <Atcud prefix="ATCUD:" className="text-[9.5px] text-muted mt-[16px]" />
        <BankAccounts
          label="Dados bancários"
          layout="table"
          className="text-[9.5px] mt-[10px]"
          labelClassName={label}
          headerClassName="text-[9px] font-bold uppercase text-muted py-[6px] border-b-2 border-brand"
          gridClassName="border-[0.75px] border-line"
        />

        <Footer className="px-[50px] justify-center h-[34px] border-t border-line">
          <Text className="text-[9px] text-muted text-center">{"{{org.name}} · {{org.website}}"}</Text>
        </Footer>
      </Document>
    </Tailwind>
  )
}
