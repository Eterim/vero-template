import {
  Tailwind, Document, Footer, Row, Column, Text, Logo, DocumentTitle,
  DocumentNumber, DocumentDate, Issuer, Customer, Payment, Items, Totals,
  Notes, AmountInWords, BankAccounts, LegalNotes, PageNumber,
} from "@veroao/invoice"

const config = {
  theme: {
    extend: {
      colors: {
        "fundo": "#FFFBF5",
        "texto": "#292524",
        "texto-suave": "#78716C",
        "terracota": "#9A3412",
        "areia": "#F3E5D3",
        "linhas": "#E7D8C6",
      },
      fontFamily: {
        sans: ["Inter"],
        display: ["Playfair Display"],
      },
    },
  },
}

// Estilos usados em vários sítios
const rotulo = "text-[9.5px] font-bold uppercase tracking-[0.75px] text-terracota mb-[7px]"
const cabecalhoTabela = "text-[9.5px] font-bold uppercase text-terracota px-[13px] py-[11px] border-b-2 border-terracota"
const linhaTabela = "px-[13px] py-3 border-b-[0.75px] border-linhas"
const detalhe = "text-[10px] text-texto-suave mt-[3px]"
const filete = "px-4 gap-[3px] border-l-4 border-terracota"

export default function Terracota() {
  return (
    <Tailwind config={config}>
      <Document className="bg-fundo font-sans text-texto px-[61px] pt-[59px]">
        <Row className="mb-[37px] items-end justify-between">
          <Column className="gap-[5px]">
            <DocumentTitle className="font-display text-[37.5px]" />
            <DocumentNumber className="text-[12.5px] text-texto-suave" />
          </Column>
          <Column className="gap-[5px] items-end">
            <Logo className="h-[45px]" fallbackClassName="font-display text-[21.5px] text-terracota" />
            <DocumentDate className="text-[11.5px] text-texto-suave" />
          </Column>
        </Row>
        <Row className="mb-[35px] gap-8">
          <Issuer label="Emitente" className={`${filete} flex-1`} labelClassName={rotulo} />
          <Customer label="Cliente" className={`${filete} flex-1`} labelClassName={rotulo} />
        </Row>
        <Items
          headerClassName={cabecalhoTabela}
          rowClassName={linhaTabela}
          detailsClassName={detalhe}
        />
        <Row className="mt-[27px] gap-[37px]">
          <Column className="gap-[13px] flex-1">
            <AmountInWords labelClassName={rotulo} />
            <Notes className="text-texto-suave" labelClassName={rotulo} />
            <Payment labelClassName={rotulo} />
            <BankAccounts labelClassName={rotulo} headerClassName={cabecalhoTabela} />
          </Column>
          <Totals
            className="bg-areia p-[21px] rounded-[5px] flex-1"
            titleClassName={rotulo}
            totalClassName="text-[22.5px] font-bold text-terracota"
            ruleClassName="border-terracota"
          />
        </Row>
        <LegalNotes className="text-[9.5px] leading-[1.35] text-texto-suave mt-6 gap-[3px]" />
        <Footer className="bg-terracota px-[61px] justify-center h-[45px]">
          <Row className="justify-between">
            <Text className="text-[10px] text-[#ffffff]">{"{{org.name}} · {{org.website}}"}</Text>
            <PageNumber className="text-[10px] font-bold text-[#ffffff]" />
          </Row>
        </Footer>
      </Document>
    </Tailwind>
  )
}
