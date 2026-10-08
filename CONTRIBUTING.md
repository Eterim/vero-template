# Contribuir

Obrigado por quereres contribuir. A forma mais comum é publicar um modelo na galeria.

## Publicar um modelo

1. Faz fork do repositório e cria um ramo.
2. Cria a pasta `templates/<nome>/` (minúsculas, números e hífenes) com `meta.json` e `modelo.tsx` - copia um dos modelos existentes como ponto de partida.
3. Vê-o enquanto o desenhas:
   ```bash
   npm install
   npx @veroao/invoice dev templates
   ```
4. Gera o `modelo.json` e as pré-visualizações (não se editam à mão) e corre as verificações:
   ```bash
   npm run templates -w packages/invoice -- <nome>
   npm run check:templates -w packages/invoice -- <nome>
   ```
5. Abre o pull request. A CI repete as verificações e a equipa revê o modelo antes de entrar.

### O `meta.json`

- `author.name`: o teu utilizador do GitHub.
- `collection`: `"comunidade"` (`vero` e `exemplos` são da equipa).
- `version`: começa em `1`; ao alterar um modelo que já existe, sobe-a. O Vero prende cada factura emitida à versão com que foi feita.
- `license`: `"MIT"`.

### O que a CI verifica

Os modelos vão parar às facturas de outras empresas, por isso a CI é exigente:

- **Âmbito**: um PR de fora da equipa só mexe em `templates/<nome>/`, num só modelo, e só altera modelos que são seus.
- **Ficheiros**: só `meta.json`, `modelo.tsx`, `modelo.json` e `preview-<tipo>.webp`; sem subpastas nem ligações; com limites de tamanho.
- **Código**: o `modelo.tsx` é lido antes de ser executado. Só pode importar de `react` e `@veroao/invoice`; não pode usar `process`, `fetch`, `eval`, `require`, temporizadores, `import()` nem acessos como `obj["con" + "structor"]`. Um modelo só descreve o aspecto - não precisa de mais nada.
- **Conteúdo**: os textos escritos no modelo não podem ter números de conta (IBAN), telefones, NIF ou outros números longos, ligações, e-mails, caracteres invisíveis, nem frases que imitem as menções fiscais ("processado por programa certificado", ATCUD, AGT, isenções, "Original", "Pago"). Isso vem sempre dos dados do documento e dos componentes (`<BankAccounts />`, `<LegalNotes />`, `<Atcud />`…). Para dados da empresa usa as variáveis: `{{org.name}}`, `{{org.website}}`, `{{org.email}}`, `{{org.phone}}`, `{{customer.name}}`, `{{document.number}}`…
- **Correspondência**: o `modelo.json` enviado tem de ser exactamente o que o `modelo.tsx` gera.
- **AGT**: cada tipo de documento declarado desenha-se sem avisos (todos os elementos obrigatórios, contraste e tamanho mínimos).

Mesmo com a CI verde, um modelo só entra com a aprovação de alguém da equipa.

## Alterar a biblioteca ou o site

Abre primeiro um issue a explicar o que queres mudar. Antes do PR:

```bash
npm run typecheck -w packages/invoice
npm test -w packages/invoice
npm run build
```

Ao contribuir, aceitas que o teu trabalho é publicado com a licença MIT.
