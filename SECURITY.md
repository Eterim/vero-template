# Security

Templates in this gallery end up on real companies' invoices. If you find a way to:

- make a template hide, change or imitate fiscal elements (number, tax ID, ATCUD, the AGT QR code, the certified software mention);
- make a template add payment details, contacts or links that don't come from the company;
- get content past the CI checks (`packages/invoice/scripts/check-templates.tsx`, `src/core/safety.ts`) that should have been rejected;
- run code outside the template while it is compiled;

**do not open a public issue.** Use "Report a vulnerability" in this repository's Security tab - the report stays private between you and the maintainers.

We reply within 72 hours.
