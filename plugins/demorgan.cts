import type * as BabelCoreNamespace from '@babel/core'
import { PluginObj } from '@babel/core'
import { LogicalExpression, UnaryExpression } from '@babel/types'

type Babel = typeof BabelCoreNamespace

export default function ({ types: t }: Babel): PluginObj {
  function simplifyComparison(negatedExpr: UnaryExpression) {
    const expr = negatedExpr.argument
    if (!t.isBinaryExpression(expr)) {
      return negatedExpr
    }

    switch (expr.operator) {
      case '===':
        return t.binaryExpression('!==', expr.left, expr.right)
      case '!==':
        return t.binaryExpression('===', expr.left, expr.right)
      case '<':
        return t.binaryExpression('>=', expr.left, expr.right)
      case '<=':
        return t.binaryExpression('>', expr.left, expr.right)
      case '>':
        return t.binaryExpression('<=', expr.left, expr.right)
      case '>=':
        return t.binaryExpression('<', expr.left, expr.right)
      default:
        return negatedExpr
    }
  }

  return {
    visitor: {
      UnaryExpression(path) {
        if (path.node.operator !== '!') {
          return
        }

        const argument = path.node.argument

        if (t.isLogicalExpression(argument)) {
          const left = argument.left
          const right = argument.right

          let newExpr: LogicalExpression
          if (argument.operator === '&&') {
            newExpr = t.logicalExpression('||', t.unaryExpression('!', left, true), t.unaryExpression('!', right, true))
          } else if (argument.operator === '||') {
            newExpr = t.logicalExpression('&&', t.unaryExpression('!', left, true), t.unaryExpression('!', right, true))
          } else {
            return
          }

          path.replaceWith(newExpr)
        } else if (t.isBinaryExpression(argument)) {
          const simplifiedExpr = simplifyComparison(path.node)
          path.replaceWith(simplifiedExpr)
        }
      },
    },
  }
}
