import { describe, it, expect } from 'vitest'
import { computeNextBeatScheduleTime, computeTargetOffsetForBeat, secondsPerBeat } from '@/lib/audio/audioUtils'

describe('audio math helpers', () => {
  it('computes next beat schedule time', () => {
    const tempo: 'fast' = 'fast'
    const spb = secondsPerBeat(tempo)
    const transport = 100
    const now = transport + 2.3 * spb
    const { nextBeatIndex, scheduleTime } = computeNextBeatScheduleTime(now, transport, tempo)
    expect(nextBeatIndex).toBe(3)
    expect(scheduleTime).toBeCloseTo(transport + 3 * spb, 6)
  })
  it('computes target offset for beat', () => {
    const tempo: 'slow' = 'slow'
    const spb = secondsPerBeat(tempo)
    const beatIndex = 5
    const bufferDuration = 8.2
    const off = computeTargetOffsetForBeat(beatIndex, tempo, bufferDuration)
    // offset uses 1-based beat index; subtract 1 to compute zero-based position within loop
    expect(off).toBeCloseTo(((beatIndex - 1) * spb) % bufferDuration, 6)
  })
})
