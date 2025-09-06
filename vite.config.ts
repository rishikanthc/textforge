import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: resolve(process.cwd(), 'src/index.ts'),
          name: 'QuillEditor',
          formats: ['es', 'umd'],
          fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            '@tiptap/core',
            '@tiptap/pm',
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-code-block-lowlight',
            '@tiptap/extension-file-handler',
            '@tiptap/extension-highlight',
            '@tiptap/extension-image',
            '@tiptap/extension-mathematics',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-mention',
            '@tiptap/suggestion',
            'katex',
            'lowlight',
            'lucide-react',
            '@floating-ui/dom'
          ],
          output: {
            globals: {
              'react': 'React',
              'react-dom': 'ReactDOM',
              '@tiptap/core': 'TiptapCore',
              '@tiptap/react': 'TiptapReact'
            }
          }
        }
      }
    }
  }
  
  return {
    plugins: [react()],
  }
})
