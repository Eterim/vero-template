# Vero Template

Facturas, recibos e notas angolanas desenhadas em **React** e **Tailwind CSS** - como o React Email, mas para documentos fiscais.

> Em desenvolvimento. A biblioteca (`packages/invoice`) já desenha e compila os modelos; ainda não está publicada no npm.

- `apps/site` - site (landing, galeria de modelos, documentação)
- `packages/invoice` - a biblioteca `@veroao/invoice` (ver o README dela)
- `templates/` - os modelos da galeria (cada um: `modelo.tsx`, `modelo.json`, `preview.png`)

Licença MIT.

## Desenvolver

```bash
npm install
npm run dev                                 # site em http://localhost:5200
npm test -w packages/invoice                # testes da biblioteca (inclui os modelos da galeria)
npm run templates -w packages/invoice       # gera modelo.json e pré-visualizações a partir de modelo.tsx
```
