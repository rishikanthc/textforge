import Mention from '@tiptap/extension-mention'

export const CustomMention = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      url: {
        default: null,
        parseHTML: element => element.getAttribute('data-mention-url') || element.getAttribute('href'),
        renderHTML: attributes => {
          if (!attributes.url) {
            return {}
          }
          return {
            'data-mention-url': attributes.url,
            href: attributes.url,
          }
        },
      },
    }
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'a',
      {
        ...HTMLAttributes,
        class: 'mention',
        href: node.attrs.url || '#',
        'data-mention-id': node.attrs.id,
        'data-link-type': 'bidirectional',
        'data-mention-label': node.attrs.label || node.attrs.id,
        'data-mention-url': node.attrs.url || '#',
        // Ensure opens in same tab
        target: "_self",
      },
      node.attrs.label || node.attrs.id,
    ]
  },
})