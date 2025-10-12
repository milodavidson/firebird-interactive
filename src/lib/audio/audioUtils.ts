import type { Tempo } from '@/lib/types'

export function secondsPerBeat(tempo: Tempo): number {
  return tempo === 'fast' ? 60 / 160 : 60 / 80
}

export function loopDuration(tempo: Tempo): number {
  return tempo === 'fast' ? 10.5 : 21
}

export function computeCurrentBeatIndex(audioNow: number, transportStart: number, tempo: Tempo): number {
  const spb = secondsPerBeat(tempo)
  const elapsed = Math.max(0, audioNow - transportStart)
  return Math.floor(elapsed / spb)
}

export function computeNextBeatScheduleTime(audioNow: number, transportStart: number, tempo: Tempo) {
  const spb = secondsPerBeat(tempo)
  const nowBeat = Math.floor((audioNow - transportStart) / spb)
  const nextBeatIndex = nowBeat + 1
  const scheduleTime = transportStart + nextBeatIndex * spb
  return { nextBeatIndex, scheduleTime }
}

export function computeTargetOffsetForBeat(beatIndex: number, tempo: Tempo, bufferDuration: number): number {
  const spb = secondsPerBeat(tempo)
  const canonicalLoop = loopDuration(tempo)
  const beatsPerLoop = Math.round(canonicalLoop / spb)
  const beatInLoop = ((beatIndex % beatsPerLoop) + beatsPerLoop) % beatsPerLoop
  let offset = beatInLoop * spb
  // Avoid floating rounding hitting the exact buffer end; clamp to start
  const epsilon = 1e-3
  if (offset >= bufferDuration - epsilon) offset = 0
  return offset
}

export function applyDecodeFades(buffer: AudioBuffer, fadeMs = 20) {
  const sampleRate = buffer.sampleRate
  const fadeSamples = Math.max(1, Math.floor((fadeMs / 1000) * sampleRate))
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch)
    // Fade in: ramp 0 -> 1 over fadeSamples, inclusive on end
    const denomIn = Math.max(1, fadeSamples - 1)
    for (let i = 0; i < fadeSamples && i < data.length; i++) {
      const gain = i / denomIn
      data[i] *= gain
    }
    // Fade out: ramp 1 -> 0 over fadeSamples, making last sample 0
    const denomOut = Math.max(1, fadeSamples - 1)
    for (let i = 0; i < fadeSamples && i < data.length; i++) {
      const idx = data.length - 1 - i
      const gain = i / denomOut // last sample (i=0) => 0; deeper => ->1
      data[idx] *= gain
    }
  }
}
