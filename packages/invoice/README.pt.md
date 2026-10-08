# @veroao/invoice

Facturas, recibos e notas angolanas em **React** e **Tailwind CSS** - com as regras da AGT incluídas.
Funciona sem o Vero: desenhas o modelo, passas os teus dados e recebes o PDF.

[English](https://github.com/Eterim/vero-template/blob/main/packages/invoice/README.md)

> Em desenvolvimento (0.x). A API pode mudar até à 1.0.

```bash
npx @veroao/invoice init       # projecto novo com um modelo de partida
# ou, num projecto que já existe:
npm install @veroao/invoice react
```

## Um modelo

```tsx
import { Tailwind, Document, Row, Logo, DocumentTitle, DocumentNumber,
  Customer, Issuer, Items, Totals, LegalNotes } from "@veroao/invoice"

export default function MyInvoice() {
  return (
    <Tailwind config={{ theme: { extend: { colors: { brand: "#0E4C63" } } } }}>
      <Document className="bg-white px-12 pt-10 text-[11px]">
        <Row className="items-start justify-between">
          <Logo className="h-12" />
          <DocumentTitle className="text-3xl font-bold uppercase text-brand" />
        </Row>
        <Row className="mt-8 gap-6">
          <Customer className="flex-1 border border-zinc-200 p-3" labelClassName="font-bold text-brand" />
          <Issuer className="flex-1" />
        </Row>
        <DocumentNumber className="mt-6 font-bold" />
        <Items className="mt-3" rowClassName="border-b border-zinc-200 even:bg-zinc-50" />
        <Totals className="ml-auto mt-4 w-1/2" totalClassName="text-xl font-bold text-brand" />
        <LegalNotes className="mt-6 text-[9px] text-zinc-500" />
      </Document>
    </Tailwind>
  )
}
```

## Ver ao vivo

```bash
npx @veroao/invoice dev
```

Abre `http://localhost:3200` com os modelos da pasta `templates/` ou `modelos/` (senão, a pasta actual):
cada `.tsx` com `export default`, ou `<pasta>/<nome>/modelo.tsx`. O PDF volta a ser desenhado sempre que
gravas, com os cinco tipos de documento (FT, FR, NC, ND, RC). Se o Tailwind ou o código tiver um erro,
aparece o componente e o motivo, e fica à vista a última versão boa. O botão **JSON para o Vero** copia
o modelo pronto a importar.

Não precisa de nada instalado no projecto: o React e a biblioteca vêm com a CLI.
Outra pasta ou porta: `npx @veroao/invoice dev modelos --port 3300`.

## Verificar

```bash
npx @veroao/invoice check
```

Faz o que o Vero e a galeria verificam a cada modelo da pasta: compila, desenha os seis tipos de documento (com a pró-forma)
sem avisos da AGT e não tem dados fiscais ou de pagamento escritos à mão. Termina com código 1 se houver problemas.

## PDF

```ts
import { render } from "@veroao/invoice"

const { pdf, warnings } = await render(<MyInvoice />, documento)   // pdf: Uint8Array
```

`documento` (`DocumentData`) traz tudo o que é fiscal - número, data, ATCUD, os 4 caracteres da
assinatura, o número do **teu** programa certificado, o URL do QR, empresa, cliente, linhas e totais.
O modelo nunca o contém. Para experimentar: `sampleDocument("FT")`.

## Usar no Vero

```ts
import { compile } from "@veroao/invoice"

const modelo = compile(<MyInvoice />)   // JSON só com o aspecto - é isto que o Vero importa
```

O React corre uma vez, do teu lado. O Vero só recebe JSON e nunca executa código de terceiros.

## O que a biblioteca garante (AGT)

- O **código QR** fica sempre no canto inferior direito da última página (a pró-forma não leva).
- O **rodapé AGT** ("XXXX-Processado por programa válido nº …" e o número do documento) está em todas as páginas.
- Desenhado a partir dos dados, quando é preciso: retenção na fonte e valor líquido, a menção do regime simplificado,
  "Não sujeito" nas linhas M02, marca de água nos anulados e o aviso da pró-forma (`documentType: "PF"`).
- Os elementos obrigatórios (tipo, número, data, NIF das partes, artigos, totais, menções legais) nunca
  faltam: se o modelo não os tiver, são acrescentados e vêm nos `warnings`.
- Texto fiscal com **contraste** mínimo (4,5) e nunca abaixo de 7 pt.
- `checkTemplate(json)` recusa modelos cujo texto próprio pareça dado fiscal ou de pagamento
  (IBAN, telefones, NIF, ligações, e-mails, menções de certificação) - isso vem sempre do documento.

## Tailwind suportado

Medidas como na web (1 px = 0,75 pt; a A4 tem 794 px de largura).

| | |
|---|---|
| Espaço | `p-* px-* py-* pt-* pb-* pl-* pr-* mt-* mb-* ml-* mr-* mx-* my-* gap-*`, `ml-auto` |
| Texto | `text-xs…6xl`, `text-[11px]`, `font-normal/semibold/bold`, `font-display`, `uppercase`, `tracking-*`, `leading-*`, `text-left/center/right` |
| Cor | paleta do Tailwind, cores do `config`, `text-[#hex]` `bg-[#hex]` `border-[#hex]` |
| Bordas | `border`, `border-2`, `border-[0.5px]`, `border-t/b/l/r-*`, `rounded-*` |
| Disposição | `flex-1`, `flex-[2]`, `items-*`, `justify-*`, `w-1/2`, `w-full`, `w-[200px]`, `h-*` |
| Variantes | `even:` (linhas alternadas da tabela) |

Não existem num PDF, e dão erro a explicar porquê: `hover:`, `md:`, `dark:`, sombras, degradês,
transformações, grelha CSS e posicionamento absoluto. Também se pode usar `style={{ fontSize: 9 }}` (pt).

## Componentes

`Tailwind` · `Document` · `Header` · `Footer` · `CornerDecoration` · `Row` · `Column` · `Text` · `Spacer` · `Hr` ·
`Logo` · `DocumentTitle` · `DocumentNumber` · `DocumentDate` · `Atcud` · `StatusBadge` · `Issuer` · `Customer` ·
`Payment` · `Items` · `Totals` · `Notes` · `AmountInWords` · `BankAccounts` · `LegalNotes` · `PageNumber`

Componentes teus, listas (`.map`) e condições funcionam. Hooks não - um modelo não tem estado.

As letras (Inter, Playfair Display) vêm no pacote, com licença OFL. Licença MIT.
