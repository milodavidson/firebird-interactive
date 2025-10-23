import type { Tempo } from '@/lib/types'
import { musicConfig } from './musicConfig'

export function secondsPerBeat(tempo: Tempo): number {
  const bpm = tempo === 'fast' ? musicConfig.bpms.fast : musicConfig.bpms.slow
  return 60 / bpm
}

export function loopDuration(tempo: Tempo): number {
  // Compute duration from explicit beatsPerLoop to avoid rounding drift.
  return musicConfig.beatsPerLoop * secondsPerBeat(tempo)
}

export function beatsPerLoop(_tempo: Tempo): number {
  // The design uses the same number of beats per loop for both tempos.
  return musicConfig.beatsPerLoop
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

export function computeNextLoopScheduleTime(audioNow: number, transportStart: number, tempo: Tempo) {
  const loopDur = loopDuration(tempo)
  const spb = secondsPerBeat(tempo)
  const elapsed = Math.max(0, audioNow - transportStart)
  const loopsSoFar = Math.floor(elapsed / loopDur)
  const nextLoopStartTime = transportStart + (loopsSoFar + 1) * loopDur
  const nextLoopBeatIndex = Math.floor((nextLoopStartTime - transportStart) / spb)
  return { nextLoopBeatIndex, scheduleTime: nextLoopStartTime }
}

// Convert an absolute 1-based beat index since transport start to a 1-based within-loop beat number for a given tempo
export function computeWithinLoopBeat(absoluteBeatIndex: number, tempo: Tempo): number {
  const bpl = beatsPerLoop(tempo)
  const zero = absoluteBeatIndex - 1
  return ((zero % bpl) + bpl) % bpl + 1
}

// Compute the 1-based within-loop beat number for a given audio time
export function computeWithinLoopBeatAtTime(audioNow: number, transportStart: number, tempo: Tempo): number {
  const abs = computeCurrentBeatIndex(audioNow, transportStart, tempo) + 1
  return computeWithinLoopBeat(abs, tempo)
}

export function computeTargetOffsetForBeat(beatIndex: number, tempo: Tempo, bufferDuration: number): number {
  const spb = secondsPerBeat(tempo)
  const bpl = Math.round(loopDuration(tempo) / spb)
  // beatIndex is 1-based for "next beat"; convert to 0-based in-loop index so beat 1 maps to offset 0
  const zeroBased = beatIndex - 1
  const withinLoopBeat = ((zeroBased % bpl) + bpl) % bpl
  const ideal = withinLoopBeat * spb
  // Align to the actual buffer by modulo its duration
  const epsilon = 0.0005
  const offset = ideal % Math.max(epsilon, bufferDuration)
  return Math.min(Math.max(0, offset), bufferDuration - epsilon)
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
