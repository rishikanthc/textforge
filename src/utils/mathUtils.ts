// Math utilities with lazy loading
let katexCSSLoaded = false
let mathExtensionPromise: Promise<any> | null = null

export const loadKatexCSS = (): Promise<void> => {
  return new Promise((resolve) => {
    if (katexCSSLoaded) {
      resolve()
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
    link.crossOrigin = 'anonymous'
    
    link.onload = () => {
      katexCSSLoaded = true
      resolve()
    }
    
    link.onerror = () => {
      console.warn('Failed to load KaTeX CSS, falling back to local import')
      // Fallback to bundled CSS
      import('katex/dist/katex.min.css').then(() => {
        katexCSSLoaded = true
        resolve()
      }).catch(() => resolve()) // Graceful degradation
    }

    document.head.appendChild(link)
  })
}

export const loadMathExtension = async () => {
  if (mathExtensionPromise) {
    return mathExtensionPromise
  }

  mathExtensionPromise = Promise.all([
    import('@tiptap/extension-mathematics'),
    loadKatexCSS()
  ]).then(([mathModule]) => {
    return mathModule.Mathematics
  })

  return mathExtensionPromise
}

export const createMathConfiguration = () => ({
  inlineOptions: {
    onClick: (node: any, pos: number) => {
      // Will be set by the editor
      return { node, pos, isBlockMath: false }
    }
  },
  blockOptions: {
    onClick: (node: any, pos: number) => {
      // Will be set by the editor  
      return { node, pos, isBlockMath: true }
    }
  },
  katexOptions: {
    throwOnError: false,
    strict: false,
    macros: {
      '\\R': '\\mathbb{R}',
      '\\N': '\\mathbb{N}',
      '\\Z': '\\mathbb{Z}',
      '\\Q': '\\mathbb{Q}',
      '\\C': '\\mathbb{C}'
    },
    trust: (context: any) => ['\\htmlId', '\\href', '\\class', '\\style', '\\data'].includes(context.command)
  }
})