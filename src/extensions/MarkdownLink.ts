import { Extension, InputRule } from '@tiptap/core'

// Matches markdown links like: [alias](https://example.com)
// - Captures alias in group 1
// - Captures URL in group 2
// Anchored to end to trigger when user types the closing ')'
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)$/

export const MarkdownLink = Extension.create({
  name: 'markdownLink',

  addInputRules() {
    return [
      new InputRule({
        find: MARKDOWN_LINK_REGEX,
        handler: ({ range, match, commands }) => {
          const [, alias, href] = match as unknown as [string, string, string]

          const text = (alias || '').trim()
          const url = (href || '').trim()
          if (!text || !url) return null

          // Use the Link extension's built-in commands
          commands.deleteRange(range)
          commands.insertContent([
            {
              type: 'text',
              text: text,
              marks: [
                {
                  type: 'link',
                  attrs: { href: url }
                }
              ]
            },
            {
              type: 'text',
              text: ' '
            }
          ])
        },
      }),
    ]
  },
})

export default MarkdownLink
