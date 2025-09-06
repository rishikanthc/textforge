# Quill Editor

A beautiful, extensible rich text editor built with Tiptap and React. Features modern, readable sans‑serif typography with multiple presets.

## Features

- 🎨 Beautiful typography with Google Fonts (presets + overrides)
- 🔧 Extensible and customizable
- ⚡ Built on Tiptap and ProseMirror
- 📝 TypeScript support
- 🎯 Minimal styling - style it your way
- 🔄 Bidirectional content flow (read and write)

## Installation

```bash
npm install quill
```

## Usage

### Basic Usage

```tsx
import React, { useState } from 'react'
import { Editor } from 'quill'
import 'quill/dist/quill.css'

function App() {
  const [content, setContent] = useState('<p>Hello World!</p>')

  return (
    <Editor
      content={content}
      onChange={setContent}
      placeholder="Start writing..."
    />
  )
}
```

### Advanced Usage with Ref

```tsx
import React, { useState, useRef } from 'react'
import { Editor, EditorRef } from 'quill'
import 'quill/dist/quill.css'

function App() {
  const [content, setContent] = useState('')
  const editorRef = useRef<EditorRef>(null)

  const handleGetContent = () => {
    const currentContent = editorRef.current?.getContent()
    console.log(currentContent)
  }

  const handleSetContent = () => {
    editorRef.current?.setContent('<h1>New Content</h1>')
  }

  return (
    <div>
      <div>
        <button onClick={handleGetContent}>Get Content</button>
        <button onClick={handleSetContent}>Set Content</button>
        <button onClick={() => editorRef.current?.focus()}>Focus</button>
      </div>
      
      <Editor
        ref={editorRef}
        content={content}
        onChange={setContent}
        placeholder="Start writing..."
        className="my-custom-editor"
      />
    </div>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `'<p>Start writing...</p>'` | Initial HTML content |
| `onChange` | `(content: string) => void` | - | Callback when content changes |
| `className` | `string` | `''` | Additional CSS classes |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text |
| `editable` | `boolean` | `true` | Whether editor is editable |
| `typographyPreset` | `'inter-plusjakarta' \| 'sourcesans-sora' \| 'figtree-epilogue' \| 'figtree-manrope' \| 'manrope-sora' \| 'worksans-poppins' \| 'publicsans-epilogue' \| 'dmsans-outfit'` | `-` | Scoped font preset applied via CSS variables |
| `fonts` | `{ body?: string; heading?: string }` | `-` | Direct font-family overrides (take precedence over `typographyPreset`) |

## Ref Methods

| Method | Type | Description |
|--------|------|-------------|
| `getContent` | `() => string` | Get current HTML content |
| `setContent` | `(content: string) => void` | Set HTML content |
| `focus` | `() => void` | Focus the editor |
| `blur` | `() => void` | Blur the editor |

## Styling

The editor comes with minimal styling by default. The only opinionated styles are for typography (customizable via CSS variables):

- Default: Body — Figtree, Headings — Manrope
- Alternatives available in the demo: Inter + Plus Jakarta Sans, Source Sans 3 + Sora, Figtree + Epilogue, Figtree + Manrope, Manrope + Sora, Work Sans + Poppins, Public Sans + Epilogue, DM Sans + Outfit

You can override fonts globally using CSS variables on `:root` (headings default to medium/500):

```css
:root {
  --font-body: 'Figtree', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  --font-heading: 'Manrope', 'Figtree', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
}
```

### Custom Styling

You can override styles by targeting these CSS classes:

```css
.quill-editor {
  /* Container styles */
  /* You can scope fonts per-editor instance too */
  --font-body: 'Figtree', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  --font-heading: 'Manrope', 'Figtree', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
}

.quill-editor-content {
  /* Content wrapper styles */
}

.quill-editor .ProseMirror {
  /* Editor content styles */
}
```

### Set fonts via props

```tsx
<Editor typographyPreset="manrope-sora" />

// or direct overrides (highest precedence)
<Editor fonts={{ body: "'Public Sans', system-ui, sans-serif", heading: "'Epilogue', sans-serif" }} />
```

## Development

To run the demo locally:

```bash
git clone https://github.com/yourusername/quill-editor.git
cd quill-editor
npm install
npm run dev
```

Visit `http://localhost:5173` to see the demo with a centered 900px editor instance.

To build the library:

```bash
npm run build:lib
```

## License

MIT
