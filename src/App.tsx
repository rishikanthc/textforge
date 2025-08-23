import { useState, useRef } from 'react'
import Editor, { type EditorRef } from './Editor'
import './editor-styles.css'
import './App.css'

function App() {
  const [content, setContent] = useState('<h1>Welcome to Quill Editor</h1><p>This is a demo of the extensible Tiptap-based editor library. Try editing this content!</p><h2>Formatting Features</h2><ul><li><strong>Bold text</strong> works perfectly</li><li><em>Italic text</em> is now enabled</li><li><mark>Highlighting</mark> is available too</li><li>Beautiful typography with Noto Sans and Space Grotesk fonts</li></ul><h3>Try These Shortcuts:</h3><ul><li><strong>Ctrl+B / Cmd+B</strong> for bold</li><li><strong>Ctrl+I / Cmd+I</strong> for italic</li><li><strong>Ctrl+Shift+H / Cmd+Shift+H</strong> for highlight</li><li>Type <code>==text==</code> for highlighting</li><li>Type <code>*text*</code> or <code>_text_</code> for italic</li></ul>')
  const editorRef = useRef<EditorRef>(null)

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
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
      </div>

      <div className="editor-container">
        <Editor
          ref={editorRef}
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing your amazing content..."
        />
      </div>

      <footer className="app-footer">
        <p>Built with ❤️ using Tiptap, React, and TypeScript</p>
      </footer>
    </div>
  )
}

export default App
