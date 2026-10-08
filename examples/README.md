# Component examples

One example per file: `<component>/<variant>.tsx`. These are the examples on the website's Components page
(`/componentes`); the `<variant>.webp` images and `<variant>.thumb.webp` thumbnails are built from them:

```bash
npm run examples -w packages/invoice
```

An example returns only the piece it shows; the script places it on a white A4 page
(`<Document className="bg-white px-12 pt-10 text-[11px]">`). With `export const page = true`, the
example returns the whole template (`<Tailwind>` / `<Document>`) and the image shows the full page.
`export const docType = "FT"` picks the document type of the sample data (FR by default).
