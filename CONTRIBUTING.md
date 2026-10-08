# Contributing

Thanks for wanting to contribute. The most common way is publishing a template to the gallery.

Portuguese is welcome in issues and pull requests.

## Publishing a template

1. Fork the repository and create a branch.
2. Create the folder `templates/<name>/` (lowercase letters, numbers and hyphens) with `meta.json` and `template.tsx` - copy one of the existing templates as a starting point.
3. Preview it while you design:
   ```bash
   npm install
   npx @veroao/invoice dev templates
   ```
4. Build `template.json` and the previews (never edit them by hand) and run the checks:
   ```bash
   npm run templates -w packages/invoice -- <name>
   npm run check:templates -w packages/invoice -- <name>
   ```
5. Open the pull request. CI runs the same checks and a maintainer reviews the template before it is merged.

### `meta.json`

- `author.name`: your GitHub username.
- `collection`: `"comunidade"` (`vero` and `exemplos` belong to the maintainers).
- `version`: starts at `1`; bump it whenever you change an existing template. Vero pins every issued invoice to the version it was made with.
- `license`: `"MIT"`.

See [templates/README.md](templates/README.md) for the full format.

### What CI checks

Templates end up on other companies' invoices, so CI is strict:

- **Scope**: a pull request from outside the team only touches `templates/<name>/`, a single template, and only templates you authored.
- **Files**: only `meta.json`, `template.tsx`, `template.json` and `preview-<type>.webp`; no subfolders or symlinks; size limits apply.
- **Code**: `template.tsx` is read before it is run. It may only import from `react` and `@veroao/invoice`, and cannot use `process`, `fetch`, `eval`, `require`, timers, `import()` or tricks like `obj["con" + "structor"]`. A template only describes how the document looks - it needs nothing else.
- **Content**: text written in the template cannot contain bank accounts (IBAN), phone numbers, tax IDs (NIF) or other long numbers, links, e-mails, invisible characters, or phrases imitating fiscal mentions ("processado por programa certificado", ATCUD, AGT, exemptions, "Original", "Pago"). Those always come from the document data and the components (`<BankAccounts />`, `<LegalNotes />`, `<Atcud />`…). For company data use the variables `{{org.name}}`, `{{org.website}}`, `{{org.email}}`, `{{org.phone}}`, `{{customer.name}}`, `{{document.number}}`…
- **Match**: the committed `template.json` must be exactly what `template.tsx` produces.
- **AGT**: every declared document type renders without warnings (all mandatory elements, minimum contrast and size).

Even with green CI, a template is only merged after a maintainer approves it.

## Changing the library or the website

Open an issue first describing what you want to change. Before the pull request:

```bash
npm run typecheck -w packages/invoice
npm test -w packages/invoice
npm run build
```

Code identifiers are in English; text shown to end users (PDF labels, library messages, website) is in Portuguese.

By contributing, you agree that your work is published under the MIT license.
