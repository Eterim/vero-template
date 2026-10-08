import type { DocumentData } from './types.js'

type DocType = DocumentData['documentType']

const SERIES: Record<DocType, string> = { FT: 'FT VERO2026/128', FR: 'FR VERO2026/57', NC: 'NC VERO2026/9', ND: 'ND VERO2026/3', RC: 'RC VERO2026/41' }

/** Documento fictício para a pré-visualização - toca em tudo: desconto, isenção, notas, pagamento. */
export function sampleDocument(documentType: DocType = 'FT'): DocumentData {
  const issuedAt = new Date('2026-10-07T14:32:00')
  const isReceipt = documentType === 'RC'
  const lines: DocumentData['lines'] = isReceipt
    ? [{ description: 'Pagamento da factura FT VERO2026/120', quantity: 1, unitPrice: 41_942_31, taxRate: 0, taxExemptionCode: 'M02', taxAmount: 0, lineTotal: 41_942_31 }]
    : [
        { description: 'Vestido Active Court - L / Amarelo', details: 'Preço promocional - preço original 27 990,00 Kz', quantity: 1, unitPrice: 27_990_00, lineDiscount: 15, taxRate: 14, lineTotal: 23_791_50, taxAmount: 3_330_81 },
        { description: 'Cinto em pele - Preto', quantity: 2, unitPrice: 6_500_00, taxRate: 14, lineTotal: 13_000_00, taxAmount: 1_820_00 },
        { description: 'Embrulho de oferta', quantity: 1, unitPrice: 500_00, taxRate: 0, taxExemptionCode: 'M04', lineTotal: 500_00, taxAmount: 0 },
      ]
  const net = lines.reduce((s, l) => s + l.lineTotal, 0)
  const tax = lines.reduce((s, l) => s + l.taxAmount, 0)
  const rates = [...new Set(lines.map((l) => l.taxRate))]
  return {
    documentType,
    number: SERIES[documentType],
    issuedAt,
    atcud: `${SERIES[documentType].split(' ')[1].replace('/', '-')}`,
    hashChars: 'Ab3x',
    certificationNumber: 'FE/271/AGT/2026',
    qrUrl: `https://quiosqueagt.minfin.gov.ao/facturacao-eletronica/consultar-fe?emissor=5000000000&document=${encodeURIComponent(SERIES[documentType])}`,
    status: documentType === 'FR' || isReceipt ? 'paid' : documentType === 'FT' ? 'pending' : undefined,
    reference: 'AO-656704',
    org: {
      name: 'A Minha Empresa, Lda.',
      taxId: '5000000000',
      addressLines: ['Rua do Timor, N.º 17, Kinaxixi', 'Ingombota, Luanda'],
      email: 'geral@aminhaempresa.ao',
      phone: '+244 923 000 000',
      website: 'aminhaempresa.ao',
      city: 'Luanda',
      bankAccounts: [
        { bank: 'BAI', iban: 'AO06 0040 0000 1234 5678 1011 2', holder: 'A Minha Empresa, Lda.' },
        { bank: 'BFA', iban: 'AO06 0006 0000 9876 5432 1012 3' },
      ],
    },
    customer: {
      name: 'Cliente Exemplo, Lda.',
      taxId: '5417000000',
      email: 'compras@clienteexemplo.ao',
      addressLines: ['Talatona, Edifício 7', 'Luanda, Angola'],
    },
    payment: documentType === 'FR' || isReceipt ? { method: 'Multicaixa Express', reference: '7e9cb196-fb0a', date: issuedAt } : undefined,
    lines,
    totals: {
      net, tax, discount: isReceipt ? 0 : 4_198_50, total: net + tax,
      byRate: rates.map((rate) => {
        const ls = lines.filter((l) => l.taxRate === rate)
        return { rate, base: ls.reduce((s, l) => s + l.lineTotal, 0), tax: ls.reduce((s, l) => s + l.taxAmount, 0) }
      }),
    },
    notes: isReceipt ? null : 'Trocas em 15 dias com o talão.',
    amountInWords: isReceipt ? 'Quarenta e um mil, novecentos e quarenta e dois kwanzas e trinta e um cêntimos' : 'Quarenta e dois mil, quatrocentos e quarenta e dois kwanzas e trinta e um cêntimos',
    currency: 'AOA',
  }
}
