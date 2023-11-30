import type * as BabelCoreNamespace from '@babel/core'
import { PluginObj } from '@babel/core'
import type * as BabelTypesNamespace from '@babel/types'
import { CallExpression } from '@babel/types'

type Babel = typeof BabelCoreNamespace

export default function ({ types: t }: Babel): PluginObj {
  function getFunctionScopeName(path: BabelCoreNamespace.NodePath<CallExpression>) {
    let currentPath: BabelCoreNamespace.NodePath<BabelTypesNamespace.Node> | null = path
    while (currentPath) {
      if (t.isFunctionDeclaration(currentPath.node)) {
        return currentPath.node.id?.name || '[anonymous]'
      }
      if (t.isArrowFunctionExpression(currentPath.node)) {
        const parent = currentPath.parentPath
        if (parent && t.isVariableDeclarator(parent.node) && t.isIdentifier(parent.node.id)) {
          return parent.node.id.name
        }
      }
      currentPath = currentPath.parentPath
    }
    return ''
  }

  return {
    name: 'console-log-location',
    visitor: {
      CallExpression(path, state) {
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object, { name: 'console' }) &&
          t.isIdentifier(path.node.callee.property, { name: 'log' })
        ) {
          const filename = state.filename || 'unknown'
          const line = path.node.loc?.start.line || 0
          const functionScopeName = getFunctionScopeName(path)

          let logPrefix = `[${filename.split('/').pop()}:${line}]`
          if (functionScopeName) {
            logPrefix += `[${functionScopeName}] `
          } else {
            logPrefix += ' '
          }

          if (path.node.arguments.length > 0 && t.isStringLiteral(path.node.arguments[0])) {
            path.node.arguments[0].value = logPrefix + path.node.arguments[0].value
          } else {
            path.node.arguments.unshift(t.stringLiteral(logPrefix.trim()))
          }
        }
      },
    },
  }
}
