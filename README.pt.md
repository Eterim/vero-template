# Vero Template

Facturas, recibos e notas angolanas desenhadas em **React** e **Tailwind CSS** - como o React Email, mas para documentos fiscais.

[![npm](https://img.shields.io/npm/v/@veroao/invoice)](https://www.npmjs.com/package/@veroao/invoice) [![CI](https://github.com/Eterim/vero-template/actions/workflows/ci.yml/badge.svg)](https://github.com/Eterim/vero-template/actions/workflows/ci.yml)

Site e documentação: https://eterim.github.io/vero-template/ · [English](README.md)

```bash
npx @veroao/invoice init       # projecto novo com um template de partida
npx @veroao/invoice dev        # pré-visualização ao vivo dos teus templates
npx @veroao/invoice check      # verificações da AGT e de segurança
```

- `apps/site` - site (landing, galeria de templates, documentação)
- `packages/invoice` - a biblioteca `@veroao/invoice` (ver o README dela)
- `templates/` - os templates da galeria (cada um: `meta.json`, `template.tsx`, `template.json`, `preview-<tipo>.webp`)

Licença MIT.

## Desenvolver

```bash
npm install
npm run dev                                 # site em http://localhost:5200
npm test -w packages/invoice                # testes da biblioteca (inclui os templates da galeria)
npm run templates -w packages/invoice       # gera template.json e pré-visualizações a partir de template.tsx
npm run check:templates -w packages/invoice # as verificações que a CI faz a cada pull request
```

## Contribuir

Templates novos entram por pull request - ver [CONTRIBUTING.md](CONTRIBUTING.md). Problemas de segurança: [SECURITY.md](SECURITY.md).
