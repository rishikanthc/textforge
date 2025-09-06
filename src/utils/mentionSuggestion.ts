import { computePosition, flip, shift } from '@floating-ui/dom'
import { posToDOMRect, ReactRenderer } from '@tiptap/react'
import { MentionList, type MentionItem } from '../components/MentionList'

const updatePosition = (editor: any, element: HTMLElement) => {
  const virtualElement = {
    getBoundingClientRect: () => 
      posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  }

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = 'max-content'
    element.style.position = strategy
    element.style.left = `${x}px`
    element.style.top = `${y}px`
  })
}

export const createMentionSuggestion = (mentionItems: MentionItem[]) => ({
  items: ({ query }: { query: string }) => {
    if (!mentionItems || !Array.isArray(mentionItems)) {
      return []
    }
    return mentionItems
      .filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10)
  },

  render: () => {
    let component: ReactRenderer
    let popup: HTMLElement

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = component.element as HTMLElement
        popup.style.position = 'absolute'
        popup.style.zIndex = '9999'

        document.body.appendChild(popup)
        updatePosition(props.editor, popup)
      },

      onUpdate(props: any) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        updatePosition(props.editor, popup)
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          component.destroy()
          return true
        }

        return (component.ref as any)?.onKeyDown?.(props)
      },

      onExit() {
        if (popup) {
          popup.remove()
        }
        component.destroy()
      },
    }
  },
})