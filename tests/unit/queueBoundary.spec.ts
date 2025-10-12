import { describe, it, expect } from 'vitest'
import { computeNextLoopScheduleTime, computeTargetOffsetForBeat, secondsPerBeat, loopDuration } from '@/lib/audio/audioUtils'

describe('queued start at loop boundary', () => {
  it('uses offset 0 at loop start (beat 1 within loop)', () => {
    const tempo: 'fast' = 'fast'
    const spb = secondsPerBeat(tempo)
    const transport = 100
    const now = transport + 2.7 * spb
    const { nextLoopBeatIndex } = computeNextLoopScheduleTime(now, transport, tempo)
    // At loop boundary, absolute nextLoopBeatIndex corresponds to in-loop beat 1 when 1-based
    const beatForQueue = nextLoopBeatIndex + 1
    const off = computeTargetOffsetForBeat(beatForQueue, tempo, loopDuration(tempo))
    expect(off).toBeCloseTo(0, 6)
  })
})
