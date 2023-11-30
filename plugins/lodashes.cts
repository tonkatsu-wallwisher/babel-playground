import type * as BabelCoreNamespace from '@babel/core'
import { PluginObj } from '@babel/core'
import { Identifier } from '@babel/types'

type Babel = typeof BabelCoreNamespace

export default function ({ types: t }: Babel): PluginObj {
  return {
    name: 'lodash-to-lodash-es',
    visitor: {
      ImportDeclaration(path, state) {
        if (path.node.source.value !== 'lodash') {
          return
        }

        const lodashMethods = new Set<string>()
        const lodashEsImports = new Map<string, Identifier>()

        // First pass: collect all lodash method usages and prepare unique identifiers
        path.parentPath.traverse({
          MemberExpression(subPath) {
            if (t.isIdentifier(subPath.node.object, { name: '_' }) && t.isIdentifier(subPath.node.property)) {
              lodashMethods.add(subPath.node.property.name)
              if (!lodashEsImports.has(subPath.node.property.name)) {
                const uniqueIdentifier = path.scope.generateUidIdentifier(subPath.node.property.name)
                lodashEsImports.set(subPath.node.property.name, uniqueIdentifier)
              }
            }
          },
        })

        // Second pass: replace lodash method usages with unique identifiers
        path.parentPath.traverse({
          MemberExpression(subPath) {
            if (
              t.isIdentifier(subPath.node.object, { name: '_' }) &&
              t.isIdentifier(subPath.node.property) &&
              lodashEsImports.has(subPath.node.property.name)
            ) {
              subPath.replaceWith(lodashEsImports.get(subPath.node.property.name)!)
            }
          },
        })

        // Create import declarations for lodash-es
        lodashMethods.forEach((method) => {
          if (lodashEsImports.has(method)) {
            const uniqueIdentifier = lodashEsImports.get(method)!
            path.scope.rename(method, uniqueIdentifier.name)
            const importSpecifier = t.importSpecifier(uniqueIdentifier, t.identifier(method))
            path.insertAfter(t.importDeclaration([importSpecifier], t.stringLiteral('lodash-es')))
          }
        })

        // Remove original lodash import
        path.remove()
      },
    },
  }
}
