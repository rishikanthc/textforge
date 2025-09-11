import { useState, useRef, useEffect } from 'react'
import Editor, { type EditorRef } from './Editor'
import { type MentionItem } from './components/MentionList'
import './editor-styles.css'
import './App.css'

function App() {
  const [content, setContent] = useState('<h1>TextForge Demo</h1><p>Welcome to TextForge, a beautiful and extensible rich text editor built with Tiptap and React. This demo showcases the editor\'s powerful features with clean system fonts optimized for excellent readability.</p><h2>Rich Text Features</h2><p>TextForge provides a comprehensive set of features for creating beautiful content. The editor uses system fonts to ensure fast loading and consistent appearance across all platforms and devices.</p><h3>Key Features to Test</h3><ul><li><strong>Bold emphasis</strong> for important concepts</li><li><em>Italic styling</em> for subtle emphasis and quotes</li><li><mark>Highlighting</mark> for critical information</li><li>Different <strong>heading levels</strong> and their hierarchy</li><li>Long paragraphs to assess reading comfort</li></ul><blockquote><p>"Good design is as little design as possible." — Dieter Rams</p></blockquote><h4>Professional Applications</h4><p>Whether you\'re building a blog, documentation site, article platform, or any content-focused application, TextForge provides the tools you need. The clean system font approach ensures fast loading and consistent appearance.</p><p>Test out the various features like math equations, code blocks, mentions, and callouts. The editor is designed to be both powerful and easy to use.</p><h5>Performance & Reliability</h5><p>Built with modern web technologies, TextForge delivers excellent performance and reliability. System fonts ensure fast loading times and consistent rendering across all platforms and devices.</p>')

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
        <h1>TextForge Rich Text Editor</h1>
        <p>A beautiful, extensible rich text editor with system fonts • Clean typography and powerful features</p>
      </header>
      
      <div className="demo-controls">
        <button onClick={handleGetContent}>Get Content</button>
        <button onClick={handleSetContent}>Set New Content</button>
        <button onClick={() => editorRef.current?.focus()}>Focus Editor</button>
        <button onClick={handleInsertInlineMath}>Insert Inline Math</button>
        <button onClick={handleInsertBlockMath}>Insert Block Math</button>
        <button onClick={handleInsertAlignTest}>Test Align</button>
        <button onClick={handleInsertCodeBlock}>Insert Code Block</button>
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
