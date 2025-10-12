export const PARTS = ['melody', 'harmony', 'rhythm', 'texture'] as const
export type PartConst = typeof PARTS[number]

// Unified instrument list; can be dragged into any part
export const INSTRUMENTS: { id: string; name: string }[] = [
  { id: 'brass', name: 'Brass' },
  { id: 'strings', name: 'Strings' },
  { id: 'woodwind', name: 'Woodwind' },
  { id: 'percussion', name: 'Percussion' }
]
