import { useEffect, useImperativeHandle, forwardRef, useState, useCallback, useRef, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { Image } from '@tiptap/extension-image'
import { Callout } from './extensions/Callout'
import { MathInputRules } from './extensions/MathInputRules'
import { MarkdownLink } from './extensions/MarkdownLink'
import { LazyMathEditDialog } from './components/LazyMathEditDialog'
import { getPresetById, type TypographyPresetId } from './typography'
import { type MentionItem } from './components/MentionList'
import { getLowlight, preloadCommonLanguages } from './utils/lowlightFactory'
import { loadMathExtension, createMathConfiguration } from './utils/mathUtils'
import { createAsyncMentionExtension, preloadMentionModules } from './utils/lazyMentionUtils'

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

// Hook for progressive extension loading
const useProgressiveExtensions = (mentions: MentionItem[]) => {
  const [codeExtension, setCodeExtension] = useState<any>(null)
  const [mathExtension, setMathExtension] = useState<any>(null)
  const [mentionExtension, setMentionExtension] = useState<any>(null)
  const [fileExtension, setFileExtension] = useState<any>(null)
  
  useEffect(() => {
    // Load code highlighting after initial render
    const loadCodeExtension = async () => {
      try {
        const [{ CodeBlockLowlight }, lowlight] = await Promise.all([
          import('@tiptap/extension-code-block-lowlight'),
          Promise.resolve(getLowlight())
        ])
        
        // Preload common languages in the background
        preloadCommonLanguages()
        
        setCodeExtension(CodeBlockLowlight.configure({
          lowlight,
          defaultLanguage: 'plaintext',
        }))
      } catch (error) {
        console.error('Failed to load code extension:', error)
      }
    }
    
    // Use requestIdleCallback for non-critical loading
    if ('requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(() => loadCodeExtension(), { timeout: 2000 })
    } else {
      setTimeout(loadCodeExtension, 100)
    }
  }, [])
  
  useEffect(() => {
    // Load math extension when needed
    const loadMath = async () => {
      try {
        const Mathematics = await loadMathExtension()
        setMathExtension(Mathematics.configure(createMathConfiguration()))
      } catch (error) {
        console.error('Failed to load math extension:', error)
      }
    }
    
    if ('requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(() => loadMath(), { timeout: 3000 })
    } else {
      setTimeout(loadMath, 200)
    }
  }, [])
  
  useEffect(() => {
    // Load mentions only if provided
    if (mentions && mentions.length > 0) {
      const loadMentions = async () => {
        try {
          const extension = await createAsyncMentionExtension(mentions)
          setMentionExtension(extension)
        } catch (error) {
          console.error('Failed to load mention extension:', error)
        }
      }
      
      // Preload mention modules
      preloadMentionModules()
      loadMentions()
    }
  }, [mentions])
  
  useEffect(() => {
    // Load file handler last (least critical)
    const loadFileHandler = async () => {
      try {
        const { FileHandler } = await import('@tiptap/extension-file-handler')
        setFileExtension(FileHandler)
      } catch (error) {
        console.error('Failed to load file handler:', error)
      }
    }
    
    if ('requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(() => loadFileHandler(), { timeout: 5000 })
    } else {
      setTimeout(loadFileHandler, 500)
    }
  }, [])
  
  return { codeExtension, mathExtension, mentionExtension, fileExtension }
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
   * Optional typography preset id. When provided, the editor will set CSS variables
   * `--font-body` and `--font-heading` on its root container, scoping fonts to this instance.
   */
  typographyPreset?: TypographyPresetId
  /**
   * Direct font overrides. If provided, takes precedence over `typographyPreset`.
   */
  fonts?: { body?: string; heading?: string }
  /**
   * Font weight for body text (100-900). Defaults to 400.
   */
  bodyWeight?: number
  /**
   * Font weight for headings (100-900). Defaults to 600.
   */
  headingWeight?: number
  /**
   * Array of mention items for @mention suggestions
   */
  mentions?: MentionItem[]
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
  typographyPreset,
  fonts,
  bodyWeight = 400,
  headingWeight = 600,
  mentions = []
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
  
  const [editorReady, setEditorReady] = useState(false)

  // Initialize auto-save hook
  const debouncedAutoSave = useAutoSave(onAutoSave, autoSaveDelay)
  
  // Progressive extension loading
  const { codeExtension, mathExtension, mentionExtension, fileExtension } = useProgressiveExtensions(mentions)

  // Memoize base extensions to prevent recreation
  const baseExtensions = useMemo(() => [
    StarterKit.configure({
      codeBlock: false, // Will be loaded progressively
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
    Highlight.configure({
      multicolor: true
    }),
    Image.configure({
      inline: true,
      HTMLAttributes: {
        class: 'editor-image',
      },
    }),
    MathInputRules,
    MarkdownLink,
    Callout,
  ], [placeholder])
  
  // Memoize extensions with progressive loading
  const extensions = useMemo(() => {
    const extensionList = [...baseExtensions]
    
    if (codeExtension) extensionList.push(codeExtension)
    
    if (mathExtension) {
      // Configure math extension with dialog handlers
      const mathConfig = createMathConfiguration()
      const configuredMath = mathExtension.configure({
        ...mathConfig,
        inlineOptions: {
          ...mathConfig.inlineOptions,
          onClick: (node: any, pos: number) => {
            setMathDialog({
              isOpen: true,
              latex: node.attrs.latex || '',
              isBlockMath: false,
              position: pos,
            })
          }
        },
        blockOptions: {
          ...mathConfig.blockOptions,
          onClick: (node: any, pos: number) => {
            setMathDialog({
              isOpen: true,
              latex: node.attrs.latex || '',
              isBlockMath: true,
              position: pos,
            })
          }
        }
      })
      extensionList.push(configuredMath)
    }
    
    if (mentionExtension) extensionList.push(mentionExtension)
    
    if (fileExtension) {
      extensionList.push(fileExtension.configure({
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        onDrop: async (currentEditor: any, files: File[], pos: number) => {
          if (!onImageUpload) {
            console.warn('onImageUpload callback not provided - using local file URLs')
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
        onPaste: async (currentEditor: any, files: File[], htmlContent: string) => {
          if (htmlContent) {
            return false
          }

          if (!onImageUpload) {
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
      }))
    }
    
    return extensionList
  }, [baseExtensions, codeExtension, mathExtension, mentionExtension, fileExtension, onImageUpload])
  
  const editor = useEditor({
    extensions,
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
      debouncedAutoSave(html)
    },
    onCreate: ({ editor }) => {
      // Editor is fully created and view is available
      setEditorReady(true)
    },
    onDestroy: () => {
      setEditorReady(false)
    }
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const handleMathDialogSave = useCallback((latex: string) => {
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
  }, [editor, mathDialog.position, mathDialog.isBlockMath])

  const handleMathDialogClose = useCallback(() => {
    setMathDialog({
      isOpen: false,
      latex: '',
      isBlockMath: false,
    })
  }, [])

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
      // Get the ProseMirror editor element only when editor is ready
      if (!editorReady || !editor?.view?.dom) {
        return null
      }
      return editor.view.dom
    },
    editor: editor
  }), [editor, editorReady])

  if (!editor) {
    return null
  }

  // Memoize typography computation to prevent recalculation
  const styleVars = useMemo(() => {
    const preset = fonts ? undefined : getPresetById(typographyPreset)
    const bodyFont = fonts?.body ?? preset?.body
    const headingFont = fonts?.heading ?? preset?.heading
    const vars: Record<string, string> = {}
    if (bodyFont) vars['--font-body'] = bodyFont
    if (headingFont) vars['--font-heading'] = headingFont
    vars['--font-weight-body'] = bodyWeight.toString()
    vars['--font-weight-heading'] = headingWeight.toString()
    return vars
  }, [fonts, typographyPreset, bodyWeight, headingWeight])

  return (
    <div className={`quill-editor ${className}`} style={styleVars}>
      <EditorContent 
        editor={editor}
        className="quill-editor-content"
      />
      
      <LazyMathEditDialog
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