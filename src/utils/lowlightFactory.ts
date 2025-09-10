import { createLowlight } from 'lowlight'

// Language definitions for dynamic loading
const LANGUAGE_MAP = {
  html: () => import('highlight.js/lib/languages/xml'),
  css: () => import('highlight.js/lib/languages/css'),
  js: () => import('highlight.js/lib/languages/javascript'),
  javascript: () => import('highlight.js/lib/languages/javascript'),
  ts: () => import('highlight.js/lib/languages/typescript'),
  typescript: () => import('highlight.js/lib/languages/typescript'),
  python: () => import('highlight.js/lib/languages/python'),
  py: () => import('highlight.js/lib/languages/python'),
  java: () => import('highlight.js/lib/languages/java'),
  json: () => import('highlight.js/lib/languages/json'),
  bash: () => import('highlight.js/lib/languages/bash'),
  shell: () => import('highlight.js/lib/languages/bash'),
  sh: () => import('highlight.js/lib/languages/bash'),
  sql: () => import('highlight.js/lib/languages/sql'),
  markdown: () => import('highlight.js/lib/languages/markdown'),
  md: () => import('highlight.js/lib/languages/markdown'),
}

class AsyncLowlight {
  private lowlight: any
  private loadedLanguages = new Set<string>()
  private loadingPromises = new Map<string, Promise<void>>()

  constructor() {
    this.lowlight = createLowlight()
  }

  async loadLanguage(language: string): Promise<void> {
    if (this.loadedLanguages.has(language)) {
      return Promise.resolve()
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(language)) {
      return this.loadingPromises.get(language)!
    }

    const loadPromise = this.doLoadLanguage(language)
    this.loadingPromises.set(language, loadPromise)
    
    try {
      await loadPromise
    } finally {
      this.loadingPromises.delete(language)
    }
  }

  private async doLoadLanguage(language: string): Promise<void> {
    const languageLoader = LANGUAGE_MAP[language as keyof typeof LANGUAGE_MAP]
    if (!languageLoader) {
      console.warn(`Language ${language} not supported`)
      return
    }

    try {
      const module = await languageLoader()
      const languageDefinition = module.default || module
      this.lowlight.register(language, languageDefinition)
      this.loadedLanguages.add(language)
    } catch (error) {
      console.error(`Failed to load language ${language}:`, error)
    }
  }

  async loadCommonLanguages(): Promise<void> {
    // Load most common languages in parallel
    const commonLanguages = ['javascript', 'typescript', 'python', 'html', 'css', 'json']
    await Promise.all(commonLanguages.map(lang => this.loadLanguage(lang)))
  }

  highlight(code: string, language?: string) {
    // If language is specified but not loaded, return unhighlighted code
    if (language && !this.loadedLanguages.has(language)) {
      // Trigger async load for next time
      this.loadLanguage(language).catch(console.error)
      
      // Return basic structure for immediate display
      return {
        value: code,
        language: 'plaintext',
      }
    }

    return this.lowlight.highlight(language || 'plaintext', code)
  }

  highlightAuto(code: string) {
    return this.lowlight.highlightAuto(code)
  }

  registered(language: string): boolean {
    return this.loadedLanguages.has(language)
  }
}

let globalLowlight: AsyncLowlight | null = null

export const getLowlight = (): AsyncLowlight => {
  if (!globalLowlight) {
    globalLowlight = new AsyncLowlight()
  }
  return globalLowlight
}

export const preloadCommonLanguages = (): Promise<void> => {
  return getLowlight().loadCommonLanguages()
}

export { AsyncLowlight }