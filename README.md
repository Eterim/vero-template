# Vero Template

Angolan invoices, receipts and credit/debit notes designed with **React** and **Tailwind CSS** - like React Email, but for tax documents. AGT (Angolan tax authority) rules included.

[![npm](https://img.shields.io/npm/v/@veroao/invoice)](https://www.npmjs.com/package/@veroao/invoice) [![CI](https://github.com/Eterim/vero-template/actions/workflows/ci.yml/badge.svg)](https://github.com/Eterim/vero-template/actions/workflows/ci.yml)

Website and docs (Portuguese): https://eterim.github.io/vero-template/ · [Português](README.pt.md)

```bash
npx @veroao/invoice init       # new project with a starter template
npx @veroao/invoice dev        # live preview of your templates
npx @veroao/invoice check      # AGT and safety checks
```

- `apps/site` - website (landing page, template gallery, documentation)
- `packages/invoice` - the `@veroao/invoice` library (see its README)
- `templates/` - the gallery templates (each one: `meta.json`, `modelo.tsx`, `modelo.json`, `preview-<type>.webp`)
- `examples/` - one example per component, used by the website

MIT licensed.

## Development

```bash
npm install
npm run dev                                 # website at http://localhost:5200
npm test -w packages/invoice                # library tests (includes the gallery templates)
npm run templates -w packages/invoice       # builds modelo.json and previews from modelo.tsx
npm run check:templates -w packages/invoice # the checks CI runs on every pull request
```

## Contributing

New templates come in through pull requests - see [CONTRIBUTING.md](CONTRIBUTING.md). Security issues: [SECURITY.md](SECURITY.md).
