import {
  Tailwind, Document, CornerDecoration, Footer, Row, Column, Text, Logo,
  DocumentTitle, DocumentNumber, DocumentDate, Atcud, Issuer, Customer,
  Items, Totals, Notes, AmountInWords, BankAccounts, LegalNotes,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        "fundo": "#FFFFFF",
        "texto": "#111827",
        "texto-suave": "#6B7280",
        "cinzento": "#374151",
        "destaque": "#000000",
        "linhas": "#C8CCD1",
        "linhas-claras": "#E5E7EB",
        "fundo-cinzento": "#F3F4F6",
        "zebra": "#F9FAFB",
      },
      fontFamily: {
        sans: ["Helvetica"],
      },
    },
  },
}

export default function Classico() {
  return (
    <Tailwind config={config}>
      <Document className="bg-fundo font-sans text-texto px-[53px] pt-[13px]">
        <CornerDecoration />
        <Row className="py-2 mb-[11px] border-b-[1.25px] border-linhas justify-end">
          <Logo className="flex-1 h-[61px]" fallback="none" />
          <DocumentTitle
            withCode
            className="text-[40px] font-bold uppercase text-right text-destaque"
          />
        </Row>
        <Row className="mb-[19px] gap-5 items-start">
          <Customer
            label="Contribuinte:"
            className="text-[10.5px] p-[11px] gap-[3px] border border-linhas flex-[4.9]"
            labelClassName="text-[9.5px] font-bold text-cinzento mb-[3px]"
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
          <DocumentDate prefix="Data de emissão:" className="text-[10px] text-texto-suave" />
          <Atcud
            prefix="ATCUD (Código Único do Documento):"
            className="text-[10px] text-texto-suave"
          />
        </Row>
        <Items
          className="text-[10.5px]"
          headerClassName="text-[10px] font-bold text-cinzento bg-fundo-cinzento"
          rowClassName="even:bg-zebra"
          gridClassName="border-[0.75px] border-linhas"
          showCurrency={false}
          columns={[
            { field: "description", label: "Produto", width: 3 },
            { field: "quantity", label: "Qt", width: 0.8 },
            { field: "unitPrice", label: "Preço Unit.", width: 1.5 },
            { field: "details", label: "Descrição", width: 2.9, className: "text-[9.5px] text-cinzento" },
            { field: "taxRate", label: "IVA", width: 1.1 },
            { field: "lineTotal", label: "Total", width: 1 },
          ]}
        />
        <Row className="mt-4">
          <Column className="flex-[5.7]" />
          <Column className="gap-[7px] flex-[4.6]">
            <Text className="text-[10.5px] font-bold text-cinzento">Totais do documento (valores em kwanzas)</Text>
            <Totals
              totalLabel="Valor total a pagar"
              byRate={false}
              showCurrency={false}
              className="text-[10.5px] px-[11px] border border-linhas"
              totalClassName="text-xs font-bold"
              rowClassName="border-b border-linhas-claras"
              totalRowClassName="bg-fundo-cinzento"
            />
          </Column>
        </Row>
        <Column className="text-[10.5px] mt-8 gap-2">
          <AmountInWords label="Por extenso:" inline labelClassName="font-bold text-texto-suave" />
          <Notes label="Notas:" inline labelClassName="font-bold text-texto-suave" />
        </Column>
        <BankAccounts
          label="DADOS BANCÁRIOS PARA PAGAMENTO"
          layout="table"
          className="text-[10.5px] mt-[21px]"
          labelClassName="text-[10.5px] font-bold mb-2"
          headerClassName="text-[9.5px] font-bold text-texto-suave bg-fundo-cinzento"
          gridClassName="border-[0.75px] border-linhas"
        />
        <LegalNotes
          parts={["exemptions","legal"]}
          className="text-[9.5px] text-texto-suave mt-[13px]"
        />
        <Footer className="px-[53px] py-[13px] justify-end h-[64px]">
          <Row className="text-[9.5px] text-texto-suave py-2 border-t-[0.75px] border-linhas-claras justify-between">
            <LegalNotes parts={["certification"]} />
            <Text>{"{{document.number}}"}</Text>
          </Row>
        </Footer>
      </Document>
    </Tailwind>
  )
}
