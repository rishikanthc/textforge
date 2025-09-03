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
    id: 'sourcesans-sora',
    label: 'Source Sans 3 (body) + Sora (headings)',
    body: "'Source Sans 3', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    heading: "'Sora', 'Source Sans 3', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  },
  {
    id: 'figtree-epilogue',
    label: 'Figtree (body) + Epilogue (headings)',
    body: "'Figtree', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    heading: "'Epilogue', 'Figtree', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  },
  {
    id: 'figtree-manrope',
    label: 'Figtree (body) + Manrope (headings)',
    body: "'Figtree', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    heading: "'Manrope', 'Figtree', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  },
  {
    id: 'manrope-sora',
    label: 'Manrope (body) + Sora (headings)',
    body: "'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    heading: "'Sora', 'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  },
  {
    id: 'worksans-poppins',
    label: 'Work Sans (body) + Poppins (headings)',
    body: "'Work Sans', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    heading: "'Poppins', 'Work Sans', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  },
  {
    id: 'publicsans-epilogue',
    label: 'Public Sans (body) + Epilogue (headings)',
    body: "'Public Sans', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    heading: "'Epilogue', 'Public Sans', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  },
  {
    id: 'dmsans-outfit',
    label: 'DM Sans (body) + Outfit (headings)',
    body: "'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
    heading: "'Outfit', 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  },
] as const

export type TypographyPresetId = typeof TYPOGRAPHY_PRESETS[number]['id']

export const getPresetById = (id: string | undefined) =>
  TYPOGRAPHY_PRESETS.find(p => p.id === id)
