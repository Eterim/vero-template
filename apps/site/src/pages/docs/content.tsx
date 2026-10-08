import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Code } from '../../components/Code'
import { C, Callout, H2, H3, P, PageTitle, Table, Ul } from '../../components/Prose'
import { LINKS } from '../../lib/links'

/** As páginas da documentação, por ordem. Os componentes têm páginas próprias (ver lib/components). */
export interface DocPage { slug: string; title: string; group: 'Começar' | 'Guias'; render: () => ReactNode }

const A = ({ to, children }: { to: string; children: ReactNode }) =>
  to.startsWith('http')
    ? <a href={to} className="text-sky-400 hover:text-sky-300">{children}</a>
    : <Link to={to} className="text-sky-400 hover:text-sky-300">{children}</Link>

const FIRST = `import { Tailwind, Document, Row, Logo, DocumentTitle, DocumentNumber,
  DocumentDate, Customer, Issuer, Items, Totals, LegalNotes } from "@veroao/invoice"

export default function MyInvoice() {
  return (
    <Tailwind config={{ theme: { extend: { colors: { brand: "#0E4C63" } } } }}>
      <Document className="bg-white px-12 pt-10 text-[11px]">
        <Row className="items-start justify-between">
          <Logo className="h-12" />
          <DocumentTitle className="text-3xl font-bold uppercase text-brand" />
        </Row>
        <DocumentNumber className="mt-2 text-right font-bold" />
        <DocumentDate className="text-right text-zinc-500" />
        <Row className="mt-8 gap-6">
          <Customer className="flex-1 border border-zinc-200 p-3" labelClassName="font-bold text-brand" />
          <Issuer className="flex-1" />
        </Row>
        <Items className="mt-6" rowClassName="border-b border-zinc-200 even:bg-zinc-50" />
        <Totals className="ml-auto mt-4 w-1/2" totalClassName="text-xl font-bold text-brand" />
        <LegalNotes className="mt-6 text-[9px] text-zinc-500" />
      </Document>
    </Tailwind>
  )
}`

export const DOC_PAGES: DocPage[] = [
  {
    slug: 'introducao', title: 'Introdução', group: 'Começar',
    render: () => (
      <>
        <PageTitle eyebrow="Começar" lead="Desenha facturas, recibos e notas em React e Tailwind CSS. A biblioteca trata das regras da AGT; o aspecto é teu.">Introdução</PageTitle>
        <P><C>@veroao/invoice</C> é uma biblioteca open source para desenhar os documentos fiscais angolanos - factura (FT), factura-recibo (FR), nota de crédito (NC), nota de débito (ND) e recibo (RC) - com componentes React e classes do Tailwind. Funciona sozinha: passas os dados do documento e recebes o PDF. E funciona com o Vero: o template importa-se no dashboard e passa a ser usado em todas as emissões.</P>
        <H2>Como funciona</H2>
        <Ul>
          <li>Escreves o template em React: <C>{'<Document>'}</C>, <C>{'<Items>'}</C>, <C>{'<Totals>'}</C>… com <C>className</C> como numa página web.</li>
          <li><C>compile()</C> corre o React uma vez e devolve um JSON só com o aspecto - sem código.</li>
          <li><C>render()</C> junta esse template aos dados do documento e desenha o PDF.</li>
          <li>No Vero, colas o JSON nas definições: o Vero valida-o, mostra-o com os dados da empresa e usa-o ao emitir.</li>
        </Ul>
        <H2>Porquê componentes fiscais</H2>
        <P>Os componentes já sabem o que é uma factura. <C>{'<Customer />'}</C> mostra o nome, o NIF, a morada e escreve "Consumidor final" quando não há NIF; <C>{'<Items />'}</C> mostra o código de isenção nas linhas sem IVA; <C>{'<LegalNotes />'}</C> traz o ATCUD, o texto legal e a menção do programa certificado. O template decide onde ficam e com que aspecto - nunca o conteúdo.</P>
        <Callout>O código QR da AGT não é um componente: fica sempre no canto inferior direito da última página, em todos os templates. Ver <A to="/docs/regras-agt">Regras da AGT</A>.</Callout>
        <H2>Próximos passos</H2>
        <Ul>
          <li><A to="/docs/instalacao">Instalar</A> e escrever <A to="/docs/primeiro-template">o primeiro template</A>.</li>
          <li>Ver os <A to="/componentes">componentes</A>, cada um com exemplos.</li>
          <li>Partir de um dos <A to="/templates">templates da galeria</A>.</li>
        </Ul>
      </>
    ),
  },
  {
    slug: 'instalacao', title: 'Instalação', group: 'Começar',
    render: () => (
      <>
        <PageTitle eyebrow="Começar" lead="Node.js 18 ou mais recente e React 18 ou 19.">Instalação</PageTitle>
        <H2>Projecto novo</H2>
        <Code className="mt-5" file="terminal" code="npx @veroao/invoice init" copyable />
        <P>Cria a pasta <C>vero-invoice</C> com o <C>package.json</C>, o <C>tsconfig.json</C> e um template de partida em <C>templates/invoice.tsx</C>. Depois: <C>cd vero-invoice</C>, <C>npm install</C> e <C>npm run dev</C>. Outra pasta: <C>npx @veroao/invoice init minhas-facturas</C>.</P>
        <H2>Num projecto que já existe</H2>
        <Code className="mt-5" file="terminal" code="npm install @veroao/invoice react" copyable />
        <P>Para só veres os templates ao vivo, não precisas de instalar nada: <C>npx @veroao/invoice dev</C> traz a sua própria cópia do React e da biblioteca. Ver <A to="/docs/ver-ao-vivo">Ver ao vivo</A>.</P>
        <H2>TypeScript</H2>
        <P>Os tipos vêm no pacote. Usa <C>{'"jsx": "react-jsx"'}</C> no <C>tsconfig.json</C>:</P>
        <Code className="mt-5" file="tsconfig.json" code={`{
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true
  }
}`} />
        <H2>Letras</H2>
        <P>A Inter e a Playfair Display vêm no pacote (licença OFL) e registam-se sozinhas. Também podes usar Helvetica e Times-Roman, que existem em todos os leitores de PDF.</P>
      </>
    ),
  },
  {
    slug: 'primeiro-template', title: 'O primeiro template', group: 'Começar',
    render: () => (
      <>
        <PageTitle eyebrow="Começar" lead="Um template é um componente React que devolve um <Document>, opcionalmente dentro de <Tailwind>.">O primeiro template</PageTitle>
        <Code className="mt-8" file="templates/factura.tsx" code={FIRST} copyable />
        <H2>O que está a acontecer</H2>
        <Ul>
          <li><C>{'<Tailwind config>'}</C> define as cores (<C>brand</C>) e as letras do template, como o <C>tailwind.config</C>.</li>
          <li><C>{'<Document>'}</C> é a página A4: <C>bg-*</C> é o fundo, <C>px-*</C> as margens, <C>pt-*</C> o espaço acima do corpo.</li>
          <li>Os componentes do documento (<C>DocumentTitle</C>, <C>Customer</C>, <C>Items</C>…) recebem só classes - os dados vêm de cada documento.</li>
        </Ul>
        <H2>Ver o resultado</H2>
        <Code className="mt-5" file="terminal" code="npx @veroao/invoice dev" copyable />
        <P>Abre <C>http://localhost:3200</C> com o PDF, que se actualiza cada vez que gravas. Para gerar o PDF no teu código, ver <A to="/docs/pdf">Gerar o PDF</A>.</P>
        <H2>Os teus componentes</H2>
        <P>Podes partir o template em componentes, usar listas (<C>.map</C>) e condições. Hooks não funcionam: um template não tem estado - corre uma vez para dar o JSON.</P>
        <Code className="mt-5" file="templates/factura.tsx" code={`const card = "flex-1 rounded border border-zinc-200 p-3"

function Parties() {
  return (
    <Row className="gap-6">
      <Customer className={card} />
      <Issuer className={card} />
    </Row>
  )
}`} />
        <Callout>Se faltar algum elemento obrigatório (tipo, número, data, partes, artigos, totais, menções legais), o PDF de pré-visualização avisa; num documento emitido, é acrescentado.</Callout>
      </>
    ),
  },
  {
    slug: 'ver-ao-vivo', title: 'Ver ao vivo', group: 'Começar',
    render: () => (
      <>
        <PageTitle eyebrow="Começar" lead="Um servidor local que desenha os teus templates e os volta a desenhar sempre que gravas.">Ver ao vivo</PageTitle>
        <Code className="mt-8" file="terminal" code="npx @veroao/invoice dev" copyable />
        <P>Procura os templates na pasta <C>templates/</C> ou <C>templates/</C> (senão, na pasta actual): cada ficheiro <C>.tsx</C> com <C>export default</C>, ou <C>{'<pasta>/<nome>/template.tsx'}</C>, como na galeria.</P>
        <H2>O que mostra</H2>
        <Ul>
          <li>O PDF com dados de exemplo, nos cinco tipos de documento: FT, FR, NC, ND e RC.</li>
          <li>Os erros do Tailwind ou do código, com o componente e o motivo - e a última versão boa à vista.</li>
          <li>O que falta para o documento ter tudo o que a AGT exige, e avisos de contraste.</li>
          <li>O código, o JSON, o botão para descarregar o PDF e o botão <strong className="text-zinc-200">JSON para o Vero</strong>.</li>
        </Ul>
        <H2>Opções</H2>
        <Table head={['Opção', 'Por omissão', 'O que faz']} rows={[
          [<C>[pasta]</C>, 'templates/ ou templates/', 'Pasta dos templates.'],
          [<C>--port</C>, '3200', 'Porta do servidor.'],
          [<C>--help</C>, '', 'Ajuda.'],
          [<C>--version</C>, '', 'Versão.'],
        ]} />
        <Code className="mt-5" file="terminal" code="npx @veroao/invoice dev templates --port 3300" />
        <H2>Verificar antes de publicar</H2>
        <Code className="mt-5" file="terminal" code="npx @veroao/invoice check" copyable />
        <P>Faz as verificações do Vero e da galeria a todos os templates da pasta: compilam, desenham os seis tipos de documento (com a pró-forma) sem avisos da AGT e não têm dados fiscais ou de pagamento escritos à mão (IBAN, telefones, NIF, ligações, e-mails, menções de certificação). Termina com erro se algum falhar - dá para usar na tua CI.</P>
      </>
    ),
  },
  {
    slug: 'tailwind', title: 'Tailwind suportado', group: 'Guias',
    render: () => (
      <>
        <PageTitle eyebrow="Guias" lead="As mesmas classes que já conheces, com as medidas da web: 1 px = 0,75 pt, e uma A4 tem 794 px de largura.">Tailwind suportado</PageTitle>
        <Table head={['', 'Classes']} rows={[
          ['Espaço', <span className="font-mono text-[12px]">p-* px-* py-* pt-* pb-* pl-* pr-* mt-* mb-* ml-* mr-* mx-* my-* gap-* ml-auto</span>],
          ['Texto', <span className="font-mono text-[12px]">text-xs…6xl text-[11px] font-normal font-semibold font-bold font-display uppercase tracking-* leading-* text-left text-center text-right</span>],
          ['Cor', <span className="font-mono text-[12px]">paleta do Tailwind, cores do config, text-[#hex] bg-[#hex] border-[#hex]</span>],
          ['Bordas', <span className="font-mono text-[12px]">border border-2 border-[0.5px] border-t/b/l/r-* rounded-*</span>],
          ['Disposição', <span className="font-mono text-[12px]">flex-1 flex-[2] items-* justify-* w-1/2 w-full w-[200px] h-*</span>],
          ['Variantes', <span className="font-mono text-[12px]">even: (linhas alternadas da tabela)</span>],
        ]} />
        <H2>O que não existe num PDF</H2>
        <P>Estas classes dão erro, com o motivo, em vez de serem ignoradas sem aviso:</P>
        <Ul>
          <li><C>hover:</C>, <C>focus:</C> - num PDF não há interacção.</li>
          <li><C>md:</C>, <C>lg:</C>, <C>dark:</C> - a página tem sempre o mesmo tamanho e o mesmo tema.</li>
          <li><C>shadow-*</C>, <C>blur-*</C>, <C>opacity-*</C>, degradês e transformações.</li>
          <li><C>grid</C>, <C>absolute</C>, <C>space-*</C> - usa <C>Row</C>, <C>Column</C> e <C>gap-*</C>.</li>
        </Ul>
        <H2>Cores e letras</H2>
        <P>As cores do <C>config</C> usam-se como no Tailwind (<C>text-brand</C>, <C>bg-brand-light</C>). As letras definem-se em <C>fontFamily.sans</C> (corpo) e <C>fontFamily.display</C> (<C>font-display</C>).</P>
        <Code className="mt-5" file="config" code={`const config = {
  theme: {
    extend: {
      colors: { background: "#FFFFFF", foreground: "#111827", brand: "#0E4C63" },
      fontFamily: { sans: ["Inter"], display: ["Playfair Display"] },
    },
  },
}`} />
        <P><C>background</C> e <C>foreground</C> são o fundo da página e a cor do texto principal: é com eles que o contraste do texto fiscal é verificado.</P>
        <H2>Estilos em objecto</H2>
        <P>Todos os componentes aceitam <C>style</C>, em pt, como no react-pdf: <C>{'style={{ fontSize: 9, color: "#52525B" }}'}</C>.</P>
      </>
    ),
  },
  {
    slug: 'dados', title: 'Os dados do documento', group: 'Guias',
    render: () => (
      <>
        <PageTitle eyebrow="Guias" lead="O template só tem aspecto. Tudo o que é fiscal chega em cada documento, já calculado e assinado.">Os dados do documento</PageTitle>
        <P>Os dados são um <C>DocumentData</C>. No Vero, é o Vero que os passa; fora do Vero, quem chama <C>render()</C>. Para experimentar, <C>sampleDocument("FT")</C> devolve um documento fictício completo.</P>
        <Table head={['Campo', 'O que é']} rows={[
          [<C>documentType</C>, 'FT, FR, NC, ND, RC ou PF (pró-forma, sem valor fiscal).'],
          [<C>number</C>, 'Série e número, ex.: FT VERO2026/128.'],
          [<C>issuedAt</C>, 'Data e hora de emissão.'],
          [<C>atcud</C>, 'Código ATCUD.'],
          [<C>hashChars</C>, 'Os 4 caracteres da assinatura, para a menção do programa certificado.'],
          [<C>certificationNumber</C>, 'Número de certificação do programa que emite.'],
          [<C>qrUrl</C>, 'O URL do código QR da AGT.'],
          [<C>org</C>, 'A empresa: nome, NIF, morada, contactos, logótipo, contas bancárias (banco, IBAN, conta, SWIFT, titular, notas) e regime de IVA (ivaRegime).'],
          [<C>customer</C>, 'O cliente: nome, NIF (opcional), morada, contactos.'],
          [<C>lines</C>, 'As linhas: descrição, quantidade, preço, desconto, IVA ou código de isenção, total.'],
          [<C>totals</C>, 'Sem impostos, impostos, descontos, total e IVA por taxa.'],
          [<C>withholding</C>, 'Retenção na fonte (tipo, taxa em %, valor). Informativa: o total não muda; acrescenta a linha da retenção e o valor líquido a pagar.'],
          [<C>status</C>, 'paid, pending ou cancelled. Anulado leva marca de água (cancelledLabel, por omissão ANULADO).'],
          [<C>payment</C>, 'Método, referência e data (documentos pagos).'],
          [<C>notes</C>, 'Observações.'],
          [<C>amountInWords</C>, 'O total por extenso.'],
          [<C>currency</C>, 'Moeda, ex.: AOA.'],
        ]} />
        <Callout>Os valores em dinheiro vêm em cêntimos (inteiros), para não haver erros de arredondamento.</Callout>
        <H2>Dados no texto livre</H2>
        <P><C>{'<Text>'}</C> aceita alguns dados entre chavetas: <C>{'{{org.name}}'}</C>, <C>{'{{org.website}}'}</C>, <C>{'{{customer.name}}'}</C>, <C>{'{{document.reference}}'}</C> e <C>{'{{document.number}}'}</C>.</P>
      </>
    ),
  },
  {
    slug: 'pdf', title: 'Gerar o PDF', group: 'Guias',
    render: () => (
      <>
        <PageTitle eyebrow="Guias" lead="render() aceita o template em React, o JSON do template ou o JSON de importação do Vero.">Gerar o PDF</PageTitle>
        <Code className="mt-8" file="gerar.tsx" code={`import { writeFileSync } from "node:fs"
import { render, sampleDocument } from "@veroao/invoice"
import MyInvoice from "./templates/factura"

const { pdf, warnings } = await render(<MyInvoice />, sampleDocument("FT"))

writeFileSync("factura.pdf", pdf)   // pdf: Uint8Array
for (const w of warnings) console.warn(w.message)`} copyable />
        <H2>Opções</H2>
        <Table head={['Opção', 'Por omissão', 'O que faz']} rows={[
          [<C>insertMissing</C>, 'true', 'Acrescenta os elementos obrigatórios que faltem. false só em editores e pré-visualizações: o que falta fica de fora e vem nos avisos.'],
        ]} />
        <H2>Avisos</H2>
        <P>Cada aviso traz uma frase pronta a mostrar (<C>message</C>) e o tipo (<C>kind</C>):</P>
        <Table head={['kind', 'Quando']} rows={[
          [<C>missing</C>, 'Faltava um elemento obrigatório.'],
          [<C>duplicate</C>, 'Um elemento obrigatório aparece mais de uma vez.'],
          [<C>contrast</C>, 'Texto fiscal que não se lia sobre o fundo - a cor foi trocada.'],
          [<C>minSize</C>, 'Texto fiscal abaixo de 7 pt - foi aumentado.'],
        ]} />
      </>
    ),
  },
  {
    slug: 'usar-no-vero', title: 'Usar no Vero', group: 'Guias',
    render: () => (
      <>
        <PageTitle eyebrow="Guias" lead="O Vero importa o template em JSON. Nunca executa código de terceiros.">Usar no Vero</PageTitle>
        <Code className="mt-8" file="compilar.tsx" code={`import { compile } from "@veroao/invoice"
import MyInvoice from "./templates/factura"

const template = compile(<MyInvoice />)   // só aspecto, sem código`} />
        <P>O JSON de importação embrulha o template com o nome e a versão. É o que copia o botão <strong className="text-zinc-200">JSON para o Vero</strong> do <C>dev</C> e de cada página da <A to="/templates">galeria</A>:</P>
        <Code className="mt-5" file="template.json" code={`{
  "format": "vero-template",
  "schemaVersion": 2,
  "id": "autor/nome-do-template",
  "version": 1,
  "name": "Nome do template",
  "author": "autor",
  "template": { "version": 2, "theme": { … }, "body": [ … ] }
}`} />
        <H2>No dashboard</H2>
        <Ul>
          <li>Nas definições dos templates do dashboard, colas o JSON.</li>
          <li>O Vero valida-o e mostra-o com os dados da tua empresa.</li>
          <li>Ao aplicares, as próximas emissões usam o template. Os documentos já emitidos não mudam.</li>
        </Ul>
        <Callout>A importação no dashboard e o botão "Abrir no Vero" estão a chegar.</Callout>
      </>
    ),
  },
  {
    slug: 'regras-agt', title: 'Regras da AGT', group: 'Guias',
    render: () => (
      <>
        <PageTitle eyebrow="Guias" lead="O que a biblioteca garante em qualquer template - para que nenhum aspecto ponha um documento fora da lei.">Regras da AGT</PageTitle>
        <H2>O código QR</H2>
        <P>Fica sempre no canto inferior direito da última página, acima do rodapé, com 96 pt e a marca da AGT ao centro. Não é um componente: nenhum template o pode mover, esconder ou deformar. Se o conteúdo lhe fosse tocar, passa para uma página nova. A pró-forma não leva QR.</P>
        <H2>O rodapé AGT</H2>
        <P>Em todas as páginas, por cima da faixa do rodapé do template: <C>XXXX-Processado por programa válido nº …</C> à esquerda (os 4 caracteres da assinatura e o número de certificação) e o número do documento à direita. Também é do motor, como o QR.</P>
        <H2>Desenhado pelo motor quando os dados o pedem</H2>
        <Ul>
          <li>Retenção na fonte e "Valor líquido a pagar", nos totais.</li>
          <li>"IVA - Regime Simplificado", a seguir aos totais, quando a empresa está nesse regime.</li>
          <li>"Não sujeito" nas linhas com o código M02 (as outras isenções: "Isento").</li>
          <li>Marca de água num documento anulado.</li>
          <li>Na pró-forma, o aviso "Documento não válido como factura", sem ATCUD nem QR.</li>
        </Ul>
        <H2>Elementos obrigatórios</H2>
        <Table head={['Elemento', 'Componente']} rows={[
          ['Tipo do documento', <C>DocumentTitle</C>],
          ['Número', <C>DocumentNumber</C>],
          ['Data de emissão', <C>DocumentDate</C>],
          ['Emitente (nome e NIF)', <C>Issuer</C>],
          ['Cliente (nome e NIF)', <C>Customer</C>],
          ['Linhas com IVA', <C>Items</C>],
          ['Totais', <C>Totals</C>],
          ['ATCUD, isenções e texto legal', <><C>LegalNotes</C> (e <C>Atcud</C>)</>],
        ]} />
        <P>Se faltar algum, o documento emitido acrescenta-o e <C>render()</C> avisa. Cada um só pode aparecer uma vez.</P>
        <H2>Legibilidade</H2>
        <Ul>
          <li>Texto fiscal com contraste mínimo de 4,5 sobre o fundo onde está; se não, usa a cor do texto do tema.</li>
          <li>Texto fiscal nunca abaixo de 7 pt.</li>
        </Ul>
        <H2>O que o template nunca contém</H2>
        <P>Números, NIF, ATCUD, a menção do programa certificado ou o QR escritos como texto. Vêm sempre dos dados do documento, através dos componentes.</P>
      </>
    ),
  },
  {
    slug: 'publicar', title: 'Publicar na galeria', group: 'Guias',
    render: () => (
      <>
        <PageTitle eyebrow="Guias" lead="Os templates da galeria vivem no repositório. Publicar é abrir um pull request com uma pasta.">Publicar na galeria</PageTitle>
        <Code className="mt-8" file="templates/" code={`templates/<nome>/
  meta.json         nome, descrição, autor, versão, tipos de documento, etiquetas
  template.tsx        o template em React + Tailwind
  template.json       o mesmo template compilado (gerado)
  preview-ft.webp   pré-visualizações de cada tipo de documento (geradas)
  …`} />
        <H2>Passos</H2>
        <Ul>
          <li>Faz fork de <A to={LINKS.github}>Eterim/vero-template</A> e cria <C>{'templates/<nome>/'}</C> com <C>meta.json</C> e <C>template.tsx</C>.</li>
          <li>Vê-o com <C>npx @veroao/invoice dev templates</C>.</li>
          <li>Gera o JSON e as imagens com <C>npm run templates -w packages/invoice -- {'<nome>'}</C>.</li>
          <li>Verifica com <C>npm run check:templates -w packages/invoice -- {'<nome>'}</C> - é o que a CI corre.</li>
          <li>Abre o pull request. A CI repete as verificações e alguém da equipa revê o template.</li>
        </Ul>
        <H2>Regras</H2>
        <Ul>
          <li>Todos os elementos obrigatórios da AGT presentes.</li>
          <li>No <C>meta.json</C>, o teu utilizador do GitHub em <C>author.name</C> e <C>"collection": "comunidade"</C>. Ao alterar um template, sobe a <C>version</C>.</li>
          <li>Nada de números de conta, telefones, NIF, ligações, e-mails ou menções fiscais escritos no template - vêm sempre dos dados da empresa e dos componentes.</li>
          <li>Sem logótipo, nome ou dados de uma empresa real - o logótipo vem da empresa que usar o template.</li>
          <li>Licença MIT.</li>
        </Ul>
      </>
    ),
  },
]

export const findDoc = (slug: string) => DOC_PAGES.find((d) => d.slug === slug)
