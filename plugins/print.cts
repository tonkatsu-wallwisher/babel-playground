import type * as BabelCoreNamespace from '@babel/core'
import { PluginObj } from '@babel/core'

type Babel = typeof BabelCoreNamespace

export default function ({ types: t }: Babel): PluginObj {
  return {
    visitor: {
      ImportDeclaration(path) {
        console.log('Found import')
      },
      VariableDeclaration(path) {
        console.log('Found variable declaration')
      },
      CallExpression(path) {
        // Check if it's `console.log`
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object, { name: 'console' }) &&
          t.isIdentifier(path.node.callee.property, { name: 'log' })
        ) {
          console.log('Found console.log')
        }
      },
    },
  }
}
