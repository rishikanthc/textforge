export type TypographyPreset = {
  id: string
  label: string
  body: string
  heading: string
}

export const TYPOGRAPHY_PRESETS: readonly TypographyPreset[] = [
  {
    id: 'inter-plusjakarta',
    label: 'Inter (body) + Plus Jakarta Sans (headings)',
    body: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    heading: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  },
  {
    id: 'bricolage-onest',
    label: 'Bricolage Grotesque (body) + Onest (headings)',
    body: "'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    heading: "'Onest', 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  },
] as const

export type TypographyPresetId = typeof TYPOGRAPHY_PRESETS[number]['id']

export const getPresetById = (id: string | undefined) =>
  TYPOGRAPHY_PRESETS.find(p => p.id === id)
