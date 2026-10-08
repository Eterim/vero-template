# Templates

Each folder is a gallery template. To publish yours, open a pull request with a new folder:

```
templates/<name>/
  meta.json         name, description, author, version, document types, tags
  modelo.tsx        the template in React + Tailwind (@veroao/invoice)
  modelo.json       the same template compiled - this is what Vero imports
  preview-ft.webp   a preview for each document type
  preview-fr.webp   (ft, fr, nc, nd, rc), 900 px wide
  …
```

`modelo.json` and the images are built from `modelo.tsx` with `npm run templates -w packages/invoice` - never edit them by hand. To see yours while you design it: `npx @veroao/invoice dev templates`.

## Rules

- The template only defines the **look**. Numbers, tax IDs, ATCUD, the certified software mention, the QR code and payment details always come from the components - never written as text.
- All mandatory AGT elements must be present.
- Before the pull request: `npm run check:templates -w packages/invoice -- <name>`. CI runs the same checks - see [CONTRIBUTING.md](../CONTRIBUTING.md) for the full list.
- Don't use the logo, name or data of a real company - the logo comes from the company using the template.
- MIT license.

## `meta.json`

```json
{
  "slug": "classico",
  "name": "Clássico",
  "description": "O modelo por omissão das facturas do Vero.",
  "author": { "name": "vero", "url": "https://vero.ao" },
  "collection": "vero",
  "version": 1,
  "license": "MIT",
  "docTypes": ["FT", "FR", "NC", "ND", "RC"],
  "tags": ["vero", "grelha"],
  "updatedAt": "2026-10-08"
}
```

`collection`: `comunidade` for contributors; `vero` (official templates) and `exemplos` belong to the maintainers. Name, description and tags are shown on the website, so write them in Portuguese.
