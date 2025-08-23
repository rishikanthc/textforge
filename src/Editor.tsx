import React, { useEffect, useImperativeHandle, forwardRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

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
}

const Editor = forwardRef<EditorRef, EditorProps>(({
  content = '<p>Start writing...</p>',
  onChange,
  className = '',
  placeholder = 'Start writing...',
  editable = true
}, ref) => {
  const editor = useEditor({
    extensions: [StarterKit],
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
    }
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