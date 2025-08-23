import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Callout } from './extensions/Callout'
import { MathInputRules } from './extensions/MathInputRules'
import { MathEditDialog } from './components/MathEditDialog'
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
  const [mathDialog, setMathDialog] = useState<{
    isOpen: boolean
    latex: string
    isBlockMath: boolean
    position?: number
  }>({
    isOpen: false,
    latex: '',
    isBlockMath: false,
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({
        multicolor: true
      }),
      Mathematics.configure({
        inlineOptions: {
          onClick: (node, pos) => {
            setMathDialog({
              isOpen: true,
              latex: node.attrs.latex || '',
              isBlockMath: false,
              position: pos,
            })
          }
        },
        blockOptions: {
          onClick: (node, pos) => {
            setMathDialog({
              isOpen: true,
              latex: node.attrs.latex || '',
              isBlockMath: true,
              position: pos,
            })
          }
        },
        katexOptions: {
          throwOnError: false,
          strict: false,
          macros: {
            '\\R': '\\mathbb{R}',
            '\\N': '\\mathbb{N}',
            '\\Z': '\\mathbb{Z}',
            '\\Q': '\\mathbb{Q}',
            '\\C': '\\mathbb{C}'
          },
          trust: (context) => ['\\htmlId', '\\href', '\\class', '\\style', '\\data'].includes(context.command)
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

  const handleMathDialogSave = (latex: string) => {
    if (!editor || mathDialog.position === undefined) return

    if (mathDialog.isBlockMath) {
      editor.chain()
        .setNodeSelection(mathDialog.position)
        .updateBlockMath({ latex })
        .focus()
        .run()
    } else {
      editor.chain()
        .setNodeSelection(mathDialog.position)
        .updateInlineMath({ latex })
        .focus()
        .run()
    }
  }

  const handleMathDialogClose = () => {
    setMathDialog({
      isOpen: false,
      latex: '',
      isBlockMath: false,
    })
  }

  if (!editor) {
    return null
  }

  return (
    <div className={`quill-editor ${className}`}>
      <EditorContent 
        editor={editor}
        className="quill-editor-content"
      />
      
      <MathEditDialog
        isOpen={mathDialog.isOpen}
        onClose={handleMathDialogClose}
        onSave={handleMathDialogSave}
        initialLatex={mathDialog.latex}
        isBlockMath={mathDialog.isBlockMath}
      />
    </div>
  )
})

Editor.displayName = 'Editor'

export default Editor