import { useEffect, useImperativeHandle, forwardRef, useState, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { FileHandler } from '@tiptap/extension-file-handler'
import { Image } from '@tiptap/extension-image'
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
import { BlockMath, InlineMath } from '@tiptap/extension-mathematics'
import { Callout } from './extensions/Callout'
import { MathInputRules } from './extensions/MathInputRules'
import { MarkdownLink } from './extensions/MarkdownLink'
import { MathEditDialog } from './components/MathEditDialog'
import 'katex/dist/katex.min.css'
import { type MentionItem } from './components/MentionList'
import { createMentionSuggestion } from './utils/mentionSuggestion'
import { CustomMention } from './extensions/CustomMention'

// Custom hook for debouncing auto-save
const useAutoSave = (
  callback: ((content: string) => void | Promise<void>) | undefined,
  delay: number = 250
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedCallbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    savedCallbackRef.current = callback
  }, [callback])

  const debouncedAutoSave = useCallback(
    (content: string) => {
      if (!savedCallbackRef.current) return

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        savedCallbackRef.current?.(content)
      }, delay)
    },
    [delay]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedAutoSave
}

interface EditorProps {
  content?: string
  onChange?: (content: string) => void
  className?: string
  placeholder?: string
  editable?: boolean
  onImageUpload?: (file: File) => Promise<string> // Returns the URL to use for the image
  onAutoSave?: (content: string) => void | Promise<void> // Callback for auto-save functionality
  autoSaveDelay?: number // Debounce delay in milliseconds (default: 250ms)
  /**
   * Array of mention items for @mention suggestions
   */
  mentions?: MentionItem[]
  /**
   * Callback fired when the editor is fully ready and mounted
   */
  onReady?: () => void
}

export interface EditorRef {
  getContent: () => string
  setContent: (content: string) => void
  focus: () => void
  blur: () => void
  getElement: () => HTMLElement | null
  editor: any
}

const Editor = forwardRef<EditorRef, EditorProps>(({
  content = '<p>Start writing...</p>',
  onChange,
  className = '',
  placeholder = 'Start writing...',
  editable = true,
  onImageUpload,
  onAutoSave,
  autoSaveDelay = 250,
  mentions = [],
  onReady
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

  // Track editor ready state
  const [isEditorReady, setIsEditorReady] = useState(false)

  // Create a ref to hold current mentions for dynamic updates
  const mentionsRef = useRef<MentionItem[]>(mentions || [])

  // Initialize auto-save hook
  const debouncedAutoSave = useAutoSave(onAutoSave, autoSaveDelay)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block to use CodeBlockLowlight
        link: {
          openOnClick: true,
          autolink: false,
          linkOnPaste: false,
        },
      }),
      Placeholder.configure({
        placeholder,
        includeChildren: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      Highlight.configure({
        multicolor: true
      }),
      InlineMath.configure({
        onClick: (node, pos) => {
          setMathDialog({
            isOpen: true,
            latex: node.attrs.latex || '',
            isBlockMath: false,
            position: pos,
          })
        },
        katexOptions: {
          displayMode: false,
          output: 'htmlAndMathml',
          throwOnError: false,
          strict: false,
          globalGroup: true,
          trust: true,
          macros: {
            '\\R': '\\mathbb{R}',
            '\\N': '\\mathbb{N}',
            '\\Z': '\\mathbb{Z}',
            '\\Q': '\\mathbb{Q}',
            '\\C': '\\mathbb{C}',
            '\\vec': '\\overrightarrow{#1}',
            '\\bm': '\\boldsymbol{#1}'
          }
        }
      }),
      BlockMath.configure({
        onClick: (node, pos) => {
          setMathDialog({
            isOpen: true,
            latex: node.attrs.latex || '',
            isBlockMath: true,
            position: pos,
          })
        },
        katexOptions: {
          displayMode: true,
          fleqn: false,
          leqno: false,
          output: 'htmlAndMathml',
          throwOnError: false,
          strict: false,
          globalGroup: true,
          trust: true,
          macros: {
            '\\R': '\\mathbb{R}',
            '\\N': '\\mathbb{N}',
            '\\Z': '\\mathbb{Z}',
            '\\Q': '\\mathbb{Q}',
            '\\C': '\\mathbb{C}',
            '\\vec': '\\overrightarrow{#1}',
            '\\bm': '\\boldsymbol{#1}'
          }
        }
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      FileHandler.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: async (currentEditor, files, pos) => {
          if (!onImageUpload) {
            console.warn('onImageUpload callback not provided - using local file URLs')
            // Fallback to data URLs if no upload handler provided
            files.forEach(file => {
              const fileReader = new FileReader()
              fileReader.readAsDataURL(file)
              fileReader.onload = () => {
                currentEditor
                  .chain()
                  .insertContentAt(pos, {
                    type: 'image',
                    attrs: {
                      src: fileReader.result,
                      alt: file.name,
                    },
                  })
                  .focus()
                  .run()
              }
            })
            return
          }

          // Use the provided upload handler
          for (const file of files) {
            try {
              const url = await onImageUpload(file)
              currentEditor
                .chain()
                .insertContentAt(pos, {
                  type: 'image',
                  attrs: {
                    src: url,
                    alt: file.name,
                  },
                })
                .focus()
                .run()
            } catch (error) {
              console.error('Failed to upload image:', error)
            }
          }
        },
        onPaste: async (currentEditor, files, htmlContent) => {
          if (htmlContent) {
            // Let other extensions handle HTML content insertion
            console.log('HTML content pasted:', htmlContent)
            return false
          }

          if (!onImageUpload) {
            console.warn('onImageUpload callback not provided - using local file URLs')
            // Fallback to data URLs
            files.forEach(file => {
              const fileReader = new FileReader()
              fileReader.readAsDataURL(file)
              fileReader.onload = () => {
                currentEditor
                  .chain()
                  .insertContentAt(currentEditor.state.selection.anchor, {
                    type: 'image',
                    attrs: {
                      src: fileReader.result,
                      alt: file.name,
                    },
                  })
                  .focus()
                  .run()
              }
            })
            return
          }

          // Use the provided upload handler
          for (const file of files) {
            try {
              const url = await onImageUpload(file)
              currentEditor
                .chain()
                .insertContentAt(currentEditor.state.selection.anchor, {
                  type: 'image',
                  attrs: {
                    src: url,
                    alt: file.name,
                  },
                })
                .focus()
                .run()
            } catch (error) {
              console.error('Failed to upload image:', error)
            }
          }
        },
      }),
      MathInputRules,
      MarkdownLink,
      Callout,
      CustomMention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: createMentionSuggestion(() => mentionsRef.current),
      })
    ],
    content,
    editable,
    onCreate: ({ editor }) => {
      // Editor is now fully mounted and ready
      setIsEditorReady(true)
      onReady?.()
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
      // Trigger debounced auto-save
      debouncedAutoSave(html)
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Update mentions ref when mentions prop changes
  useEffect(() => {
    mentionsRef.current = mentions || []
  }, [mentions])

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
    getElement: () => {
      if (!editor || !editor.view || !isEditorReady) {
        return null
      }
      return editor.view.dom as HTMLElement || null
    },
    editor: editor
  }), [editor, isEditorReady])

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
