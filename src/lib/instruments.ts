export const PARTS = ['melody', 'harmony', 'rhythm', 'texture'] as const
export type PartConst = typeof PARTS[number]

// Exactly 4 instrument IDs per part to yield 64 files with 2 dynamics x 2 tempos
export const INSTRUMENTS_BY_PART: Record<PartConst, { id: string; name: string; family?: string }[]> = {
  melody: [
    { id: 'brass', name: 'Brass', family: 'melody' },
    { id: 'strings', name: 'Strings', family: 'melody' },
    { id: 'woodwind', name: 'Woodwind', family: 'melody' },
    { id: 'percussion', name: 'Percussion', family: 'melody' }
  ],
  harmony: [
    { id: 'brass', name: 'Brass', family: 'harmony' },
    { id: 'strings', name: 'Strings', family: 'harmony' },
    { id: 'woodwind', name: 'Woodwind', family: 'harmony' },
    { id: 'percussion', name: 'Percussion', family: 'harmony' }
  ],
  rhythm: [
    { id: 'brass', name: 'Brass', family: 'rhythm' },
    { id: 'strings', name: 'Strings', family: 'rhythm' },
    { id: 'woodwind', name: 'Woodwind', family: 'rhythm' },
    { id: 'percussion', name: 'Percussion', family: 'rhythm' }
  ],
  texture: [
    { id: 'brass', name: 'Brass', family: 'texture' },
    { id: 'strings', name: 'Strings', family: 'texture' },
    { id: 'woodwind', name: 'Woodwind', family: 'texture' },
    { id: 'percussion', name: 'Percussion', family: 'texture' }
  ]
}
