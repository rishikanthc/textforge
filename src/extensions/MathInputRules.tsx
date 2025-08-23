import { Extension } from '@tiptap/core'
import { InputRule } from '@tiptap/core'

export const MathInputRules = Extension.create({
  name: 'mathInputRules',

  addInputRules() {
    return [
      // Inline math: $...$
      new InputRule({
        find: /\$([^$\n\r]+)\$$/,
        handler: ({ state, range, match }) => {
          const [fullMatch, latex] = match
          const { tr } = state
          const start = range.from
          const end = range.to

          if (!latex.trim()) return null

          // Delete the matched text
          tr.delete(start, end)

          // Insert inline math node using the command
          const success = state.schema.nodes.inlineMath && tr.setMeta('addToHistory', false)
          if (success) {
            const inlineMathNode = state.schema.nodes.inlineMath.create({
              latex: latex.trim()
            })
            tr.insert(start, inlineMathNode)
            return tr
          }

          return null
        },
      }),

      // Block math: $$...$$
      new InputRule({
        find: /\$\$([^]*?)\$\$$/,
        handler: ({ state, range, match }) => {
          const [fullMatch, latex] = match
          const { tr } = state
          const start = range.from
          const end = range.to

          if (!latex.trim()) return null

          // Delete the matched text
          tr.delete(start, end)

          // Insert block math node using the command
          const success = state.schema.nodes.blockMath && tr.setMeta('addToHistory', false)
          if (success) {
            const blockMathNode = state.schema.nodes.blockMath.create({
              latex: latex.trim()
            })
            tr.insert(start, blockMathNode)
            return tr
          }

          return null
        },
      }),
    ]
  },

  addCommands() {
    return {
      // Helper command to insert inline math with syntax
      insertInlineMathWithSyntax: (latex: string) => ({ commands }) => {
        return commands.insertInlineMath({ latex })
      },
      
      // Helper command to insert block math with syntax  
      insertBlockMathWithSyntax: (latex: string) => ({ commands }) => {
        return commands.insertBlockMath({ latex })
      },
    }
  },
})

export default MathInputRules