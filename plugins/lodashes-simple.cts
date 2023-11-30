import type * as BabelCoreNamespace from '@babel/core'
import { PluginObj } from '@babel/core'

type Babel = typeof BabelCoreNamespace

export default function ({ types: t }: Babel): PluginObj {
  return {
    name: 'lodash-to-lodash-es',
    visitor: {
      CallExpression(path) {
        // Verify callee object's identifier is `_`
        if (
          !t.isMemberExpression(path.node.callee) ||
          !t.isIdentifier(path.node.callee.object, { name: '_' }) ||
          !t.isIdentifier(path.node.callee.property)
        ) {
          return
        }
        path.node.callee = t.identifier(path.node.callee.property.name)
      },
    },
  }
}
