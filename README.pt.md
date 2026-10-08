# Vero Template

Facturas, recibos e notas angolanas desenhadas em **React** e **Tailwind CSS** - como o React Email, mas para documentos fiscais.

[![npm](https://img.shields.io/npm/v/@veroao/invoice)](https://www.npmjs.com/package/@veroao/invoice) [![CI](https://github.com/Eterim/vero-template/actions/workflows/ci.yml/badge.svg)](https://github.com/Eterim/vero-template/actions/workflows/ci.yml)

Site e documentação: https://eterim.github.io/vero-template/ · [English](README.md)

```bash
npm install @veroao/invoice react
npx @veroao/invoice dev        # pré-visualização ao vivo dos teus modelos
```

- `apps/site` - site (landing, galeria de modelos, documentação)
- `packages/invoice` - a biblioteca `@veroao/invoice` (ver o README dela)
- `templates/` - os modelos da galeria (cada um: `meta.json`, `modelo.tsx`, `modelo.json`, `preview-<tipo>.webp`)

Licença MIT.

## Desenvolver

```bash
npm install
npm run dev                                 # site em http://localhost:5200
npm test -w packages/invoice                # testes da biblioteca (inclui os modelos da galeria)
npm run templates -w packages/invoice       # gera modelo.json e pré-visualizações a partir de modelo.tsx
npm run check:templates -w packages/invoice # as verificações que a CI faz a cada pull request
```

## Contribuir

Modelos novos entram por pull request - ver [CONTRIBUTING.md](CONTRIBUTING.md). Problemas de segurança: [SECURITY.md](SECURITY.md).
