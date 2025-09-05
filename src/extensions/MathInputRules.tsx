import { Extension } from '@tiptap/core'
import { InputRule } from '@tiptap/core'

export const MathInputRules = Extension.create({
  name: 'mathInputRules',

  addInputRules() {
    return [
      // Inline math: $...$
      new InputRule({
        find: /\$([^$\n\r]+)\$$/,
        handler: ({ state, range, match, commands }) => {
          const [, latex] = match
          if (!latex.trim()) return null

          // Use commands instead of direct transaction manipulation
          commands.deleteRange(range)
          
          // Try different possible node names using commands
          const nodeTypes = ['inline-math', 'inlineMath', 'math_inline', 'mathematics_inline']
          
          for (const nodeType of nodeTypes) {
            if (state.schema.nodes[nodeType]) {
              // Use insertContentAt to insert the math node
              commands.insertContentAt(range.from, {
                type: nodeType,
                attrs: { latex: latex.trim() }
              })
              return
            }
          }
        },
      }),

      // Block math: $$...$$
      new InputRule({
        find: /\$\$([^]*?)\$\$$/,
        handler: ({ state, range, match, commands }) => {
          const [, latex] = match
          if (!latex.trim()) return null

          // Use commands instead of direct transaction manipulation
          commands.deleteRange(range)
          
          // Try different possible node names using commands
          const nodeTypes = ['block-math', 'blockMath', 'math_display', 'mathematics_display']
          
          for (const nodeType of nodeTypes) {
            if (state.schema.nodes[nodeType]) {
              // Use insertContentAt to insert the math node
              commands.insertContentAt(range.from, {
                type: nodeType,
                attrs: { latex: latex.trim() }
              })
              return
            }
          }
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
