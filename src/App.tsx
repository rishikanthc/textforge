import { useState, useRef, useEffect } from 'react'
import Editor, { type EditorRef } from './Editor'
import { type MentionItem } from './components/MentionList'
import './editor-styles.css'
import './App.css'
import { TYPOGRAPHY_PRESETS, getPresetById, type TypographyPresetId } from './typography'

function App() {
  const [content, setContent] = useState('<h1>Welcome to Quill Editor</h1><p>This is a demo of the extensible Tiptap-based editor library. Try editing this content!</p><h2>Typography & Formatting</h2><ul><li><strong>Bold text</strong> for emphasis</li><li><em>Italic text</em> for nuance</li><li><mark>Highlighting</mark> when needed</li><li>Experiment with the typography presets in the demo controls</li></ul><h3>Try These Features:</h3><ul><li><strong>Ctrl+B / Cmd+B</strong> for bold</li><li><strong>Ctrl+I / Cmd+I</strong> for italic</li><li><strong>Ctrl+Shift+H / Cmd+Shift+H</strong> for highlight</li><li>Type <code>==text==</code> for highlighting</li><li>Type <code>*text*</code> or <code>_text_</code> for italic</li><li>Type <code>@</code> to mention someone</li></ul>')

  // Mock mention data
  const mentionItems: MentionItem[] = [
    { id: 'john-doe', label: 'John Doe', url: '/users/john-doe' },
    { id: 'jane-smith', label: 'Jane Smith', url: '/users/jane-smith' },
    { id: 'alex-johnson', label: 'Alex Johnson', url: '/users/alex-johnson' },
    { id: 'sarah-wilson', label: 'Sarah Wilson', url: '/users/sarah-wilson' },
    { id: 'mike-brown', label: 'Mike Brown', url: '/users/mike-brown' },
    { id: 'emily-davis', label: 'Emily Davis', url: '/users/emily-davis' },
    { id: 'tom-miller', label: 'Tom Miller', url: '/users/tom-miller' },
    { id: 'lisa-garcia', label: 'Lisa Garcia', url: '/users/lisa-garcia' },
    { id: 'david-martinez', label: 'David Martinez', url: '/users/david-martinez' },
    { id: 'anna-taylor', label: 'Anna Taylor', url: '/users/anna-taylor' },
  ]
  const editorRef = useRef<EditorRef>(null)
  
  // Auto-save demo state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [autoSaveDelay, setAutoSaveDelay] = useState(250)
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null)
  const [autoSaveCount, setAutoSaveCount] = useState(0)

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  // Auto-save handler function
  const handleAutoSave = (content: string) => {
    console.log('Auto-saving content:', content.slice(0, 100) + '...')
    setLastAutoSaved(new Date())
    setAutoSaveCount(prev => prev + 1)
    
    // In a real application, you would save to your backend here
    // For demo purposes, we're just simulating the save operation
    localStorage.setItem('quill-editor-autosave', content)
  }

  const handleGetContent = () => {
    const currentContent = editorRef.current?.getContent()
    console.log('Current content:', currentContent)
    alert('Content logged to console')
  }

  const handleSetContent = () => {
    editorRef.current?.setContent('<h1>New Content</h1><p>This content was set programmatically!</p>')
  }

  const handleInsertInlineMath = () => {
    // Test if we can manually insert math
    const editor = editorRef.current?.editor
    if (editor) {
      console.log('Available commands:', Object.keys(editor.commands))
      editor.commands.insertInlineMath({ latex: 'E = mc^2' })
    }
  }

  const handleInsertBlockMath = () => {
    const editor = editorRef.current?.editor  
    if (editor) {
      // Test with a simple equation first
      editor.commands.insertBlockMath({ 
        latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' 
      })
    }
  }

  const handleInsertAlignTest = () => {
    const editor = editorRef.current?.editor  
    if (editor) {
      editor.commands.insertBlockMath({ 
        latex: '\\begin{aligned}\na &= b + c\\\\\nd &= e - f\n\\end{aligned}' 
      })
    }
  }

  const handleInsertCodeBlock = () => {
    const editor = editorRef.current?.editor  
    if (editor) {
      editor.commands.insertContent({
        type: 'codeBlock',
        attrs: {
          language: 'javascript'
        },
        content: [
          {
            type: 'text',
            text: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10));'
          }
        ]
      })
    }
  }

  const [fontPreset, setFontPreset] = useState<TypographyPresetId>(() => (localStorage.getItem('quill-font-preset') as TypographyPresetId) || 'figtree-manrope')

  useEffect(() => {
    const preset = getPresetById(fontPreset) || TYPOGRAPHY_PRESETS[0]
    const root = document.documentElement
    root.style.setProperty('--font-body', preset.body)
    root.style.setProperty('--font-heading', preset.heading)
    localStorage.setItem('quill-font-preset', preset.id)
  }, [fontPreset])

  // Mock image upload handler - in a real app, this would upload to your server
  const handleImageUpload = async (file: File): Promise<string> => {
    console.log('Uploading image:', file.name, file.size, file.type)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real implementation, you would:
    // 1. Upload the file to your server/cloud storage
    // 2. Return the permanent URL
    
    // For demo purposes, we'll create a data URL (not recommended for production)
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Quill Editor Demo</h1>
        <p>A beautiful, extensible editor built with Tiptap and React</p>
      </header>
      
      <div className="demo-controls">
        <button onClick={handleGetContent}>Get Content</button>
        <button onClick={handleSetContent}>Set New Content</button>
        <button onClick={() => editorRef.current?.focus()}>Focus Editor</button>
        <button onClick={handleInsertInlineMath}>Insert Inline Math</button>
        <button onClick={handleInsertBlockMath}>Insert Block Math</button>
        <button onClick={handleInsertAlignTest}>Test Align</button>
        <button onClick={handleInsertCodeBlock}>Insert Code Block</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Typography:
          <select
            value={fontPreset}
            onChange={(e) => setFontPreset(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 6 }}
          >
            {TYPOGRAPHY_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="auto-save-controls">
        <h3>Auto-Save Demo</h3>
        <div className="auto-save-settings">
          <label>
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => setAutoSaveEnabled(e.target.checked)}
            />
            Enable Auto-Save
          </label>
          
          <label>
            Delay (ms):
            <input
              type="number"
              value={autoSaveDelay}
              onChange={(e) => setAutoSaveDelay(Number(e.target.value))}
              min="100"
              max="5000"
              step="50"
            />
          </label>
        </div>
        
        <div className="auto-save-status">
          <p><strong>Auto-save count:</strong> {autoSaveCount}</p>
          {lastAutoSaved && (
            <p><strong>Last auto-saved:</strong> {lastAutoSaved.toLocaleTimeString()}</p>
          )}
          <p><em>Start typing in the editor to see auto-save in action!</em></p>
        </div>
      </div>

      <div className="editor-container">
        <Editor
          ref={editorRef}
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your amazing content..."
          onImageUpload={handleImageUpload}
          onAutoSave={autoSaveEnabled ? handleAutoSave : undefined}
          autoSaveDelay={autoSaveDelay}
          mentions={mentionItems}
        />
      </div>

      <footer className="app-footer">
        <p>Built with ❤️ using Tiptap, React, and TypeScript</p>
      </footer>
    </div>
  )
}

export default App
