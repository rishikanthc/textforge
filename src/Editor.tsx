import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
// Import common programming languages
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import markdown from 'highlight.js/lib/languages/markdown'
// load common languages with "common"
import { common, createLowlight } from 'lowlight'

// create a lowlight instance with common languages loaded
const lowlight = createLowlight(common)

// Register additional specific languages
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('javascript', js)
lowlight.register('ts', ts)
lowlight.register('typescript', ts)
lowlight.register('python', python)
lowlight.register('py', python)
lowlight.register('java', java)
lowlight.register('json', json)
lowlight.register('bash', bash)
lowlight.register('shell', bash)
lowlight.register('sh', bash)
lowlight.register('sql', sql)
lowlight.register('markdown', markdown)
lowlight.register('md', markdown)
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
      StarterKit.configure({
        codeBlock: false, // Disable default code block to use CodeBlockLowlight
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
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