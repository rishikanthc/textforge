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
        handler: ({ state, range, match }) => {
          const [fullMatch, alias, href] = match as unknown as [string, string, string]

          console.log('MarkdownLink triggered:', { fullMatch, alias, href, range })

          const text = (alias || '').trim()
          const url = (href || '').trim()
          if (!text || !url) {
            console.log('Invalid text or URL:', { text, url })
            return null
          }

          // Ensure the schema has a link mark
          const linkMark = state.schema.marks.link
          if (!linkMark) {
            console.log('No link mark found in schema')
            return null
          }

          console.log('Creating link:', { text, url })

          const { tr } = state
          const start = range.from
          const end = range.to

          // Delete the markdown syntax
          tr.delete(start, end)

          // Create the link mark with proper attributes
          const linkMarkInstance = linkMark.create({ href: url })
          
          // Create text node with the link mark applied
          const linkedTextNode = state.schema.text(text, [linkMarkInstance])
          
          // Insert the linked text
          tr.insert(start, linkedTextNode)
          
          // Insert a space after to exit link mode
          const spaceNode = state.schema.text(' ')
          tr.insert(start + text.length, spaceNode)

          console.log('Link created successfully')
          return tr
        },
      }),
    ]
  },
})

export default MarkdownLink
