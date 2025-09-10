import type { MentionItem } from '../components/MentionList'

let mentionModulesPromise: Promise<{
  MentionList: React.ComponentType<any>
  createMentionSuggestion: (items: MentionItem[]) => any
  CustomMention: any
}> | null = null

export const loadMentionModules = async () => {
  if (mentionModulesPromise) {
    return mentionModulesPromise
  }

  mentionModulesPromise = Promise.all([
    import('../components/MentionList'),
    import('./mentionSuggestion'),
    import('../extensions/CustomMention'),
    import('@floating-ui/dom') // Ensure floating UI is loaded
  ]).then(([mentionListModule, suggestionModule, customMentionModule]) => ({
    MentionList: mentionListModule.MentionList,
    createMentionSuggestion: suggestionModule.createMentionSuggestion,
    CustomMention: customMentionModule.CustomMention
  }))

  return mentionModulesPromise
}

export const createAsyncMentionExtension = async (mentions: MentionItem[]) => {
  const { CustomMention, createMentionSuggestion } = await loadMentionModules()
  
  return CustomMention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
    suggestion: createMentionSuggestion(mentions),
  })
}

// Preload mention modules when we know we'll need them
export const preloadMentionModules = () => {
  loadMentionModules().catch(console.error)
}