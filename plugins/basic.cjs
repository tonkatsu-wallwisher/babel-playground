/**
 * @param {import('@babel/core')} babel
 * @returns {import('@babel/core').PluginObj}
 */
module.exports = function ({ types: t }) {
  return {
    visitor: {
      NumericLiteral(path) {
        // Change all numeric literals to number 42
        path.replaceWith(t.numericLiteral(42))
        // Invalidate path to avoid infinite loop
        path.skip()
      },
    },
  }
}
