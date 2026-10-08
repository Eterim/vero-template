/**
 * Lê o template.tsx SEM o executar e recusa o que um template não precisa e que pode ser
 * usado para fazer mal quando a CI (ou alguém) o corre: imports fora de react e
 * @veroao/invoice, acesso ao sistema, à rede, a eval e afins.
 *
 * É a primeira barreira - a CI corre sem segredos e com permissões só de leitura.
 */
import ts from 'typescript'

export interface SourceIssue { line: number; message: string }

const ALLOWED_IMPORTS = new Set(['react', '@veroao/invoice'])

const FORBIDDEN_NAMES = new Set([
  'process', 'globalThis', 'global', 'window', 'self', 'document', 'navigator', 'location',
  'require', 'module', 'exports', '__dirname', '__filename', 'Buffer',
  'eval', 'Function', 'AsyncFunction', 'GeneratorFunction', 'Reflect', 'Proxy', 'WebAssembly',
  'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'Worker', 'SharedArrayBuffer', 'Atomics',
  'setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask',
  'Deno', 'Bun', 'importScripts',
])

const FORBIDDEN_PROPS = new Set(['constructor', '__proto__', 'prototype', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__'])

export function auditSource(source: string, fileName = 'template.tsx'): SourceIssue[] {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const issues: SourceIssue[] = []
  const add = (node: ts.Node, message: string) => issues.push({ line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1, message })

  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const spec = node.moduleSpecifier
      if (spec && (!ts.isStringLiteral(spec) || !ALLOWED_IMPORTS.has(spec.text))) {
        add(node, `import de ${spec.getText(sf)} - um template só pode importar de ${[...ALLOWED_IMPORTS].join(' e ')}`)
      }
    } else if (ts.isImportEqualsDeclaration(node)) {
      add(node, 'import = require(...) não é permitido')
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      add(node, 'import() dinâmico não é permitido')
    } else if (ts.isMetaProperty(node)) {
      add(node, `${node.getText(sf)} não é permitido`)
    } else if (ts.isIdentifier(node) && FORBIDDEN_NAMES.has(node.text) && !isPropertyName(node)) {
      add(node, `"${node.text}" não é permitido num template`)
    } else if (ts.isPropertyAccessExpression(node) && FORBIDDEN_PROPS.has(node.name.text)) {
      add(node, `".${node.name.text}" não é permitido num template`)
    } else if (ts.isElementAccessExpression(node)) {
      const arg = node.argumentExpression
      if (ts.isStringLiteralLike(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
        if (FORBIDDEN_PROPS.has(arg.text) || FORBIDDEN_NAMES.has(arg.text)) add(node, `["${arg.text}"] não é permitido num template`)
      } else if (!ts.isNumericLiteral(arg) && !ts.isIdentifier(arg)) {
        add(node, 'acesso com chave calculada (obj[a + b]) não é permitido - use obj.nome ou obj[i]')
      }
    } else if (ts.isTaggedTemplateExpression(node)) {
      add(node, 'templates com etiqueta (tag`...`) não são permitidos')
    } else if (node.kind === ts.SyntaxKind.WithStatement || node.kind === ts.SyntaxKind.DebuggerStatement) {
      add(node, `${ts.SyntaxKind[node.kind]} não é permitido`)
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return issues
}

/** `a.process` ou `{ process: 1 }` - nome de propriedade, não a variável global. */
function isPropertyName(node: ts.Identifier) {
  const p = node.parent
  return (ts.isPropertyAccessExpression(p) && p.name === node)
    || (ts.isPropertyAssignment(p) && p.name === node)
    || (ts.isJsxAttribute(p) && p.name === node)
    || (ts.isPropertySignature(p) && p.name === node)
    || (ts.isImportSpecifier(p) && p.propertyName === node)
}
