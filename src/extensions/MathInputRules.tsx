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
          const [, latex] = match
          const { tr } = state
          const start = range.from
          const end = range.to

          if (!latex.trim()) return null

          tr.delete(start, end)

          if (state.schema.nodes.inlineMath) {
            const inlineMathNode = state.schema.nodes.inlineMath.create({ latex: latex.trim() })
            tr.insert(start, inlineMathNode)
          }

          // No return value required; Tiptap applies the transaction
          return null
        },
      }),

      // Block math: $$...$$
      new InputRule({
        find: /\$\$([^]*?)\$\$$/,
        handler: ({ state, range, match }) => {
          const [, latex] = match
          const { tr } = state
          const start = range.from
          const end = range.to

          if (!latex.trim()) return null

          tr.delete(start, end)

          if (state.schema.nodes.blockMath) {
            const blockMathNode = state.schema.nodes.blockMath.create({ latex: latex.trim() })
            tr.insert(start, blockMathNode)
          }

          return null
        },
      }),
    ]
  },

  addCommands() {
    return {
      insertInlineMathWithSyntax:
        (latex: string) => ({ commands }: { commands: any }) =>
          commands.insertInlineMath({ latex }),
      insertBlockMathWithSyntax:
        (latex: string) => ({ commands }: { commands: any }) =>
          commands.insertBlockMath({ latex }),
    } as any
  },
})

export default MathInputRules
