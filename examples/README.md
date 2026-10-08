# Exemplos dos componentes

Um exemplo por ficheiro: `<componente>/<variante>.tsx`. São os exemplos da página Componentes
do site (`/componentes`); as imagens `<variante>.webp` e as miniaturas `<variante>.thumb.webp` são
geradas a partir deles:

```bash
npm run examples -w packages/invoice
```

Um exemplo devolve só o pedaço que mostra; o script põe-no numa página A4 branca
(`<Document className="bg-white px-12 pt-10 text-[11px]">`). Com `export const page = true`, o
exemplo devolve o modelo inteiro (`<Tailwind>` / `<Document>`) e a imagem mostra a página toda.
`export const docType = "FT"` escolhe o tipo de documento dos dados de exemplo (por omissão FR).
