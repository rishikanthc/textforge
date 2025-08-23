import React from 'react'
import { Extension, Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  AlertCircle, 
  Zap 
} from 'lucide-react'

interface CalloutNodeViewProps {
  node: {
    attrs: {
      type: string
    }
  }
  updateAttributes: (attrs: any) => void
  deleteNode: () => void
  selected: boolean
}

const CalloutNodeView: React.FC<CalloutNodeViewProps> = ({
  node,
  selected
}) => {
  const { type } = node.attrs

  const getIcon = () => {
    switch (type) {
      case 'note':
        return <Info />
      case 'tip':
        return <Lightbulb />
      case 'important':
        return <Zap />
      case 'warning':
        return <AlertTriangle />
      case 'caution':
        return <AlertCircle />
      default:
        return <Info />
    }
  }

  const getTitle = () => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <NodeViewWrapper 
      className={`callout ${selected ? 'ProseMirror-selectednode' : ''}`}
      data-callout={type}
    >
      <div className="callout-title">
        <span className="callout-title-icon">
          {getIcon()}
        </span>
        <span className="callout-title-text">
          {getTitle()}
        </span>
      </div>
      <div className="callout-content">
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  )
}

// Custom Callout Node
export const CalloutNode = Node.create({
  name: 'calloutNode',
  
  group: 'block',
  
  content: 'block+',
  
  addAttributes() {
    return {
      type: {
        default: 'note',
        parseHTML: element => element.getAttribute('data-callout'),
        renderHTML: attributes => {
          return {
            'data-callout': attributes.type,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'callout' }, HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView)
  },
})

export const Callout = Extension.create({
  name: 'callout',

  addExtensions() {
    return [CalloutNode]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('callout'),
        props: {
          handleKeyDown: (view, event) => {
            if (event.key === 'Enter') {
              const { state } = view
              const { selection } = state
              const { $from } = selection
              
              // Check if we're in a blockquote
              let inBlockquote = false
              let blockquotePos = 0
              for (let depth = $from.depth; depth > 0; depth--) {
                const node = $from.node(depth)
                if (node.type.name === 'blockquote') {
                  inBlockquote = true
                  blockquotePos = $from.before(depth)
                  break
                }
              }
              
              // Get the current paragraph text
              const paragraphStart = $from.start()
              const paragraphEnd = $from.end()
              const paragraphText = state.doc.textBetween(paragraphStart, paragraphEnd)
              
              // Check for callout pattern (both with and without > prefix)
              const calloutMatch = paragraphText.match(/^(?:>\s*)?\[!(\w+)\]\s*(.*)/)
              
              if (calloutMatch) {
                const [, calloutType, calloutContent] = calloutMatch
                
                // Validate callout type
                const validTypes = ['note', 'tip', 'important', 'warning', 'caution']
                const normalizedType = calloutType.toLowerCase()
                
                if (!validTypes.includes(normalizedType)) {
                  return false // Don't process invalid callout types
                }
                
                // Create callout content nodes
                const contentNodes = calloutContent.trim() ? [
                  state.schema.nodes.paragraph.create(null, [
                    state.schema.text(calloutContent.trim())
                  ])
                ] : [
                  state.schema.nodes.paragraph.create(null, [])
                ]
                
                // Create the callout node
                const calloutNode = state.schema.nodes.calloutNode.create(
                  { type: normalizedType },
                  contentNodes
                )
                
                // Replace the paragraph or blockquote with the callout
                const { tr } = state
                if (inBlockquote) {
                  // Replace the entire blockquote
                  tr.replaceWith(blockquotePos, blockquotePos + $from.node(-1).nodeSize, calloutNode)
                } else {
                  // Replace just the paragraph
                  tr.replaceWith(paragraphStart, paragraphEnd, calloutNode)
                }
                
                // Set cursor to the end of the callout content
                const calloutEnd = inBlockquote ? blockquotePos + calloutNode.nodeSize : paragraphStart + calloutNode.nodeSize
                tr.setSelection(TextSelection.create(tr.doc, calloutEnd - 1))
                
                view.dispatch(tr)
                return true
              }
            }
            return false
          },
        },
      }),
    ]
  },

  addCommands() {
    return {
      setCallout: (attributes) => ({ commands }) => {
        return commands.setNode('calloutNode', attributes)
      },
    }
  },
})

export default Callout