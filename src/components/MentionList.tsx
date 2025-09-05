import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

export interface MentionItem {
  id: string
  label: string
  url?: string
}

interface MentionListProps {
  items: MentionItem[]
  command: (item: { id: string; label: string; url?: string }) => void
}

interface MentionListRef {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
      const item = items[index]
      if (item) {
        command({ id: item.id, label: item.label, url: item.url })
      }
    }

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length)
    }

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length)
    }

    const enterHandler = () => {
      selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [items])

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          upHandler()
          return true
        }

        if (event.key === 'ArrowDown') {
          downHandler()
          return true
        }

        if (event.key === 'Enter') {
          enterHandler()
          return true
        }

        return false
      },
    }))

    return (
      <div className="mention-dropdown">
        {items.length ? (
          items.map((item, index) => (
            <button
              className={`mention-item ${index === selectedIndex ? 'mention-item--selected' : ''}`}
              key={item.id}
              onClick={() => selectItem(index)}
              type="button"
            >
              <span className="mention-item__label">{item.label}</span>
              {item.url && (
                <span className="mention-item__url">{item.url}</span>
              )}
            </button>
          ))
        ) : (
          <div className="mention-item mention-item--no-result">No results</div>
        )}
      </div>
    )
  }
)

MentionList.displayName = 'MentionList'