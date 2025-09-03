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
          entry: resolve(__dirname, 'src/index.ts'),
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
            'katex',
            'lowlight',
            'lucide-react'
          ],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM'
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
