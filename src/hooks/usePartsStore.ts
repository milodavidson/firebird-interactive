'use client'

import { create } from 'zustand'
import type { AssignedInstrument, MusicalPart, PartId, Tempo } from '@/lib/types'

export type Store = {
  parts: MusicalPart[]
  play: boolean
  tempo: Tempo
  soloInstanceId: string | null
  selectedInstrument: { id: string; name: string } | null
  // mutable refs mirrors
  partsRef: { current: MusicalPart[] }
  playStateRef: { current: boolean }
  transportStartRef: { current: number | null }
  currentTempoRef: { current: Tempo }
  deferredQueueRef: { current: AssignedInstrument[] }
  removedInstanceIdsRef: { current: Set<string> }
  nodeStartTimesRef: { current: Record<string, { soft?: number[]; loud?: number[]; beatIndex?: number[] }> }
  setPlay: (p: boolean) => void
  setTempo: (t: Tempo) => void
  setParts: (updater: (prev: MusicalPart[]) => MusicalPart[]) => void
  setSelectedInstrument: (sel: { id: string; name: string } | null) => void
  setSoloInstanceId: (id: string | null) => void
}

const initialParts: MusicalPart[] = [
  { id: 'melody', name: 'Melody', assignedInstruments: [] },
  { id: 'harmony', name: 'Harmony', assignedInstruments: [] },
  { id: 'rhythm', name: 'Rhythm', assignedInstruments: [] },
  { id: 'texture', name: 'Texture', assignedInstruments: [] }
]

export const usePartsStore = create<Store>((set: any, get: any) => ({
  parts: initialParts,
  play: false,
  tempo: 'slow',
  soloInstanceId: null,
  selectedInstrument: null,
  partsRef: { current: initialParts },
  playStateRef: { current: false },
  transportStartRef: { current: null },
  currentTempoRef: { current: 'slow' },
  deferredQueueRef: { current: [] },
  removedInstanceIdsRef: { current: new Set() },
  nodeStartTimesRef: { current: {} },
  setPlay(p: boolean) {
    set({ play: p })
    get().playStateRef.current = p
  },
  setTempo(t: 'fast' | 'slow') {
    set({ tempo: t })
    // Only update the runtime tempo ref when not actively playing;
    // during playback, the scheduler controls when currentTempoRef changes.
    if (!get().playStateRef.current) {
      get().currentTempoRef.current = t
    }
  },
  setParts(updater: (prev: MusicalPart[]) => MusicalPart[]) {
    set((state: { parts: MusicalPart[] }) => {
      const next = updater(state.parts)
      get().partsRef.current = next
      return { parts: next }
    })
  },
  setSelectedInstrument(sel) {
    set({ selectedInstrument: sel })
  },
  setSoloInstanceId(id) {
    set({ soloInstanceId: id })
  }
}))
