# Modelos

Cada pasta é um modelo da galeria. Para publicar o teu, abre um pull request com uma pasta nova:

```
templates/<nome>/
  meta.json         nome, descrição, autor, versão, tipos de documento, etiquetas
  modelo.tsx        o modelo em React + Tailwind (@veroao/invoice)
  modelo.json       o mesmo modelo compilado - é isto que o Vero importa
  preview-ft.webp   pré-visualização de cada tipo de documento
  preview-fr.webp   (ft, fr, nc, nd, rc), 900 px de largura
  …
```

`modelo.json` e as imagens são gerados a partir de `modelo.tsx` com `npm run templates -w packages/invoice` - não se editam à mão. Para ver o teu enquanto o desenhas: `npx @veroao/invoice dev templates`.

## Regras

- O modelo só define o **aspecto**. Números, NIF, ATCUD, a menção do programa certificado, o QR e os dados de pagamento vêm sempre dos componentes - nunca escritos como texto.
- Todos os elementos obrigatórios da AGT têm de estar presentes.
- Antes do pull request: `npm run check:templates -w packages/invoice -- <nome>`. A CI corre o mesmo - ver [CONTRIBUTING.md](../CONTRIBUTING.md) para a lista completa.
- Não uses o logótipo, o nome ou os dados de uma empresa real - o logótipo vem da empresa que usar o modelo.
- Licença MIT.

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

`collection`: `comunidade` para quem contribui; `vero` (modelos oficiais) e `exemplos` são da equipa.
