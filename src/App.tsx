import { useState, useRef } from 'react'
import Editor, { type EditorRef } from './Editor'
import './editor-styles.css'
import './App.css'

function App() {
  const [content, setContent] = useState('<h1>Welcome to Quill Editor</h1><p>This is a demo of the extensible Tiptap-based editor library. Try editing this content!</p><h2>Features</h2><ul><li>Beautiful typography with Noto Sans and Space Grotesk fonts</li><li>Extensible and customizable</li><li>Built on Tiptap and ProseMirror</li><li>TypeScript support</li></ul>')
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
