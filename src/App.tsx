import { useState, useRef, useEffect } from 'react'
import Editor, { type EditorRef } from './Editor'
import { type MentionItem } from './components/MentionList'
import './editor-styles.css'
import './App.css'
import { TYPOGRAPHY_PRESETS, getPresetById, type TypographyPresetId } from './typography'

function App() {
  const [content, setContent] = useState('<h1>Typography Testing Ground</h1><p>This comprehensive demo showcases TextForge\'s extensive typography capabilities. We\'ve carefully curated over 25 font pairings from Google Fonts, all optimized for long-form reading and aesthetic appeal.</p><h2>The Art of Font Pairing</h2><p>Great typography is invisible—it guides the reader through your content without drawing attention to itself. Our collection focuses exclusively on sans-serif fonts that excel in digital environments, providing excellent readability across all screen sizes and resolutions.</p><h3>Key Features to Test</h3><ul><li><strong>Bold emphasis</strong> for important concepts</li><li><em>Italic styling</em> for subtle emphasis and quotes</li><li><mark>Highlighting</mark> for critical information</li><li>Different <strong>heading levels</strong> and their hierarchy</li><li>Long paragraphs to assess reading comfort</li></ul><blockquote><p>"Typography is the craft of endowing human language with a durable visual form." — Robert Bringhurst</p></blockquote><h4>Professional Applications</h4><p>Whether you\'re building a blog, documentation site, article platform, or any content-focused application, these font combinations have been selected for their versatility and professional appearance. Each pairing balances personality with practicality.</p><p>Try switching between different font presets using the dropdown above to see how dramatically typography can change the feel of your content. Notice how some combinations feel more technical, others more friendly, and some more editorial in nature.</p><h5>Technical Excellence</h5><p>All fonts support variable font technology where available, ensuring optimal loading performance and smooth scaling across different weights and styles. They also include comprehensive character sets for international content.</p>')

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

  const [fontPreset, setFontPreset] = useState<TypographyPresetId>(() => (localStorage.getItem('quill-font-preset') as TypographyPresetId) || 'inter-plusjakarta')
  const [bodyWeight, setBodyWeight] = useState<number>(() => parseInt(localStorage.getItem('quill-body-weight') || '400'))
  const [headingWeight, setHeadingWeight] = useState<number>(() => parseInt(localStorage.getItem('quill-heading-weight') || '600'))

  useEffect(() => {
    const preset = getPresetById(fontPreset) || TYPOGRAPHY_PRESETS[0]
    const root = document.documentElement
    root.style.setProperty('--font-body', preset.body)
    root.style.setProperty('--font-heading', preset.heading)
    root.style.setProperty('--font-weight-body', bodyWeight.toString())
    root.style.setProperty('--font-weight-heading', headingWeight.toString())
    localStorage.setItem('quill-font-preset', preset.id)
    localStorage.setItem('quill-body-weight', bodyWeight.toString())
    localStorage.setItem('quill-heading-weight', headingWeight.toString())
  }, [fontPreset, bodyWeight, headingWeight])

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
        <h1>TextForge Typography Gallery</h1>
        <p>Test 25+ carefully curated font pairings • All optimized for readability and aesthetics</p>
      </header>
      
      <div className="demo-controls">
        <button onClick={handleGetContent}>Get Content</button>
        <button onClick={handleSetContent}>Set New Content</button>
        <button onClick={() => editorRef.current?.focus()}>Focus Editor</button>
        <button onClick={handleInsertInlineMath}>Insert Inline Math</button>
        <button onClick={handleInsertBlockMath}>Insert Block Math</button>
        <button onClick={handleInsertAlignTest}>Test Align</button>
        <button onClick={handleInsertCodeBlock}>Insert Code Block</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '300px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>
            Typography Preset ({TYPOGRAPHY_PRESETS.length} self-hosted fonts):
          </label>
          <select
            value={fontPreset}
            onChange={(e) => setFontPreset(e.target.value as TypographyPresetId)}
            style={{ 
              padding: '0.75rem', 
              borderRadius: 8, 
              border: '2px solid #e0e0e0',
              fontSize: '0.9rem',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {TYPOGRAPHY_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
            Current: <strong>{getPresetById(fontPreset)?.label}</strong>
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#333' }}>
              Body Weight: {bodyWeight}
            </label>
            <input
              type="range"
              min="100"
              max="900"
              step="100"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(parseInt(e.target.value))}
              style={{ width: '150px' }}
            />
            <span style={{ fontSize: '0.7rem', color: '#888' }}>100 (Thin) → 900 (Black)</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#333' }}>
              Heading Weight: {headingWeight}
            </label>
            <input
              type="range"
              min="100"
              max="900"
              step="100"
              value={headingWeight}
              onChange={(e) => setHeadingWeight(parseInt(e.target.value))}
              style={{ width: '150px' }}
            />
            <span style={{ fontSize: '0.7rem', color: '#888' }}>100 (Thin) → 900 (Black)</span>
          </div>
        </div>
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
          typographyPreset={fontPreset}
          bodyWeight={bodyWeight}
          headingWeight={headingWeight}
        />
      </div>

      <footer className="app-footer">
        <p>Built with ❤️ using Tiptap, React, and TypeScript</p>
      </footer>
    </div>
  )
}

export default App
