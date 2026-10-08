import { describe, expect, it } from 'vitest'
import { useState } from 'react'
import { compile, CompileError, Column, Customer, Document, Footer, Items, Row, Tailwind, Text, Totals } from './index.js'

describe('compile()', () => {
  it('transforma React + Tailwind no modelo JSON', () => {
    const t = compile(
      <Tailwind config={{ theme: { extend: { colors: { destaque: '#0E4C63' }, fontFamily: { sans: ['Inter'] } } } }}>
        <Document className="bg-white px-12 pt-8 text-[12px]">
          <Row className="gap-4">
            <Customer label="Para" className="flex-1 border border-zinc-200 p-3" labelClassName="font-bold text-destaque" />
          </Row>
          <Items rowClassName="border-b border-zinc-200 even:bg-zinc-50" columns={[{ field: 'description', label: 'Artigo', width: 3 }, { field: 'quantity' }]} />
          <Totals className="ml-auto w-1/2" totalRowClassName="bg-zinc-100" />
          <Footer className="h-[40px] px-12"><Text>{'{{org.name}}'}</Text></Footer>
        </Document>
      </Tailwind>,
    )
    expect(t.theme.colors).toEqual({ fundo: '#FFFFFF', texto: '#111111', destaque: '#0E4C63' })
    expect(t.theme.fonts).toEqual({ body: 'Inter', display: 'Inter' })
    expect(t.page).toEqual({ background: '#ffffff', marginX: 36, marginTop: 24 })
    expect(t.theme.styles?.body).toEqual({ size: 9 })
    expect(Object.keys(t.theme.styles ?? {})).toEqual(['rotulo', 'cabecalhoTabela', 'linhaTabela', 'detalhe', 'body'])
    expect(t.body[0]).toEqual({
      type: 'row', style: { gap: 12 },
      children: [{ type: 'party', role: 'customer', label: 'Para', style: { padding: 9, border: { width: 0.75, color: '#e4e4e7' }, flex: 1 }, labelStyle: { weight: 700, color: 'destaque' } }],
    })
    expect(t.body[1]).toMatchObject({ type: 'items', zebra: '#fafafa', rowStyle: { borderBottom: { width: 0.75, color: '#e4e4e7' } }, columns: [{ field: 'description', label: 'Artigo', flex: 3 }, { field: 'quantity' }] })
    expect(t.body[2]).toMatchObject({ type: 'totals', totalBackground: '#f4f4f5', style: { marginLeft: 'auto', width: '50%' } })
    expect(t.bottom).toEqual({ height: 30, style: { paddingX: 36 }, children: [{ type: 'text', text: '{{org.name}}' }] })
  })

  it('aceita componentes próprios, listas e condições', () => {
    const Rotulo = ({ children }: { children: string }) => <Text className="uppercase">{children}</Text>
    const nomes = ['Um', 'Dois']
    const t = compile(
      <Document>
        <Column>
          {nomes.map((n) => <Rotulo key={n}>{n}</Rotulo>)}
          {false && <Text>escondido</Text>}
          <>
            <Text>fragmento</Text>
          </>
        </Column>
      </Document>,
    )
    expect((t.body[0] as { children: { text: string }[] }).children.map((c) => c.text)).toEqual(['Um', 'Dois', 'fragmento'])
  })

  it('aceita style em objecto (pt)', () => {
    const t = compile(<Document><Text style={{ fontSize: 9, color: '#123456', marginTop: 4 }}>x</Text></Document>)
    expect(t.body[0]).toEqual({ type: 'text', text: 'x', style: { size: 9, color: '#123456', marginTop: 4 } })
  })

  it('junta todos os problemas numa só mensagem', () => {
    function ComHook() { const [v] = useState('x'); return <Text>{v}</Text> }
    let err: CompileError | undefined
    try {
      compile(
        <Tailwind config={{ theme: { extend: { fontFamily: { sans: ['Comic Sans'] } } } }}>
          <Document>
            <div>html</div>
            <Text className="hover:underline">a</Text>
            solto
            <ComHook />
          </Document>
        </Tailwind>,
      )
    } catch (e) { err = e as CompileError }
    expect(err).toBeInstanceOf(CompileError)
    const all = err!.message
    expect(all).toContain('"Comic Sans" não está disponível')
    expect(all).toContain('<div> elementos HTML não existem num PDF')
    expect(all).toContain('hover:underline')
    expect(all).toContain('texto solto')
    expect(all).toContain('hooks não são suportados')
  })

  it('exige um <Document>', () => {
    expect(() => compile(<Text>x</Text>)).toThrow('<Document>')
  })
})
