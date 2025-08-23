import React, { useEffect, useImperativeHandle, forwardRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Callout } from './extensions/Callout'
import { MathInputRules } from './extensions/MathInputRules'
import 'katex/dist/katex.min.css'

interface EditorProps {
  content?: string
  onChange?: (content: string) => void
  className?: string
  placeholder?: string
  editable?: boolean
}

export interface EditorRef {
  getContent: () => string
  setContent: (content: string) => void
  focus: () => void
  blur: () => void
  editor: any
}

const Editor = forwardRef<EditorRef, EditorProps>(({
  content = '<p>Start writing...</p>',
  onChange,
  className = '',
  placeholder = 'Start writing...',
  editable = true
}, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({
        multicolor: true
      }),
      Mathematics.configure({
        inlineOptions: {
          onClick: (node, pos) => {
            const katex = prompt('Enter LaTeX calculation:', node.attrs.latex)
            if (katex) {
              editor?.chain().setNodeSelection(pos).updateInlineMath({ latex: katex }).focus().run()
            }
          }
        },
        blockOptions: {
          onClick: (node, pos) => {
            const katex = prompt('Enter LaTeX calculation:', node.attrs.latex)
            if (katex) {
              editor?.chain().setNodeSelection(pos).updateBlockMath({ latex: katex }).focus().run()
            }
          }
        },
        katexOptions: {
          throwOnError: false,
          macros: {
            '\\R': '\\mathbb{R}',
            '\\N': '\\mathbb{N}'
          }
        }
      }),
      MathInputRules,
      Callout
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getHTML() || '',
    setContent: (newContent: string) => {
      editor?.commands.setContent(newContent)
    },
    focus: () => {
      editor?.commands.focus()
    },
    blur: () => {
      editor?.commands.blur()
    },
    editor: editor
  }), [editor])

  if (!editor) {
    return null
  }

  return (
    <div className={`quill-editor ${className}`}>
      <EditorContent 
        editor={editor}
        className="quill-editor-content"
      />
    </div>
  )
})

Editor.displayName = 'Editor'

export default Editor