import { describe, it, expect } from 'vitest'
import { computeTargetOffsetForBeat, secondsPerBeat, loopDuration } from '@/lib/audio/audioUtils'

function approx(a: number, b: number, eps = 1e-3) {
  return Math.abs(a - b) <= eps
}

describe('computeTargetOffsetForBeat alignment', () => {
  it('maps same beat number across tempos to consistent position', () => {
    const bFast = secondsPerBeat('fast')
    const bSlow = secondsPerBeat('slow')
    const durFast = loopDuration('fast') // canonical
    const durSlow = loopDuration('slow')
    const bufferFast = durFast // pretend buffer matches canonical
    const bufferSlow = durSlow

    const beats = [1, 2, 8, 16]
    for (const beat of beats) {
      const offFast = computeTargetOffsetForBeat(beat, 'fast', bufferFast)
      const offSlow = computeTargetOffsetForBeat(beat, 'slow', bufferSlow)
      // Convert offsets back to beat numbers (1-based) for comparison
      const beatFast = Math.floor(offFast / bFast) + 1
      const beatSlow = Math.floor(offSlow / bSlow) + 1
      expect(beatFast).toBe(beat <= Math.round(durFast / bFast) ? beat : ((beat - 1) % Math.round(durFast / bFast)) + 1)
      expect(beatSlow).toBe(beat <= Math.round(durSlow / bSlow) ? beat : ((beat - 1) % Math.round(durSlow / bSlow)) + 1)
    }
  })
})
