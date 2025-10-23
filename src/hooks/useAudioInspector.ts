'use client'

import { useEffect } from 'react'
import { computeCurrentBeatIndex } from '@/lib/audio/audioUtils'
import { computeWithinLoopBeat, computeWithinLoopBeatAtTime, secondsPerBeat, loopDuration, beatsPerLoop } from '@/lib/audio/audioUtils'
import { usePartsStore } from './usePartsStore'
import { audioService } from '@/lib/audio/AudioService'
import type { AudioInspectorSnapshot } from '@/lib/types'
import type { AudioScheduler } from '@/lib/audio/AudioScheduler'

declare global {
  interface Window {
    __audioInspector?: AudioInspectorSnapshot
  }
}

export function useAudioInspector(scheduler?: AudioScheduler) {
  const store = usePartsStore()
  useEffect(() => {
    const inspector: any = {
      getAudioBuffers: () => audioService.getInspectorSnapshot().getAudioBuffers(),
      getAudioBuffersByTempo: () => audioService.getBuffersByInstTempoSnapshot(),
      getNodeStartTimes: () => {
        const arrMap = store.nodeStartTimesRef.current
        const out: Record<string, { soft?: number; loud?: number }> = {}
        for (const [id, v] of Object.entries(arrMap)) {
          const soft = v.soft && v.soft.length > 0 ? v.soft[v.soft.length - 1] : undefined
          const loud = v.loud && v.loud.length > 0 ? v.loud[v.loud.length - 1] : undefined
          out[id] = { soft, loud }
        }
        return out
      },
      getDeferredQueue: () =>
        store.deferredQueueRef.current.map(q => ({ id: q.id, instrumentId: q.instrumentId, queueStartTime: q.queueStartTime!, queueTimeRemaining: q.queueTimeRemaining! })),
      getPlayState: () => store.playStateRef.current,
      getParts: () => JSON.parse(JSON.stringify(store.partsRef.current)),
      getTransportStartTime: () => store.transportStartRef.current,
      getTempo: () => store.currentTempoRef.current,
      getAudioTime: () => (audioService.audioCtx ? audioService.audioCtx.currentTime : null),
      getWithinBeat1: () => {
        const ctx = audioService.audioCtx
        if (!ctx) return null
        const start = store.transportStartRef.current
        const tempo = store.currentTempoRef.current
        if (start == null) return null
        const abs = computeCurrentBeatIndex(ctx.currentTime, start, tempo) + 1
        return computeWithinLoopBeat(abs, tempo)
      },
      getNextWithinBeat1: () => {
        const ctx = audioService.audioCtx
        if (!ctx) return null
        const start = store.transportStartRef.current
        const tempo = store.currentTempoRef.current
        if (start == null) return null
        const absNext = computeCurrentBeatIndex(ctx.currentTime, start, tempo) + 2
        return computeWithinLoopBeat(absNext, tempo)
      },
      getWithinBeatAtTime: (t: number) => {
        const start = store.transportStartRef.current
        const tempo = store.currentTempoRef.current
        if (start == null) return null
        return computeWithinLoopBeatAtTime(t, start, tempo)
      },
      getWithinBeatAtTimeForTempo: (t: number, tempo: 'fast' | 'slow') => {
        const start = store.transportStartRef.current
        if (start == null) return null
        return computeWithinLoopBeatAtTime(t, start, tempo)
      },
      // Expose useful audio math helpers so tests can derive timing from runtime config
      getSecondsPerBeatForTempo: (tempo: 'fast' | 'slow') => {
        return secondsPerBeat(tempo)
      },
      getLoopDurationForTempo: (tempo: 'fast' | 'slow') => {
        return loopDuration(tempo)
      },
      getBeatsPerLoop: () => {
        return beatsPerLoop('fast')
      },
      getLastTempoSwitchExecution: () => (scheduler ? scheduler.getLastTempoSwitchExecution() : null)
    }

    // Optional extended info for debugging: arrays of start times
    Object.defineProperty(inspector, 'getNodeStartTimesExt', {
      get() {
        return () => JSON.parse(JSON.stringify(store.nodeStartTimesRef.current))
      },
      enumerable: false
    })

    Object.defineProperty(inspector, 'scheduledTempoSwitch', {
      get() {
        return scheduler ? scheduler.getScheduledTempoSwitch() : null
      },
      enumerable: true
    })

    Object.defineProperty(inspector, 'getPostSwitchBeatCorrection', {
      get() {
        return () => (scheduler ? scheduler.getPostSwitchBeatCorrection() : 0)
      },
      enumerable: true
    })
    Object.defineProperty(inspector, 'setPostSwitchBeatCorrection', {
      get() {
        return (n: number) => scheduler?.setPostSwitchBeatCorrection(n)
      },
      enumerable: true
    })

    window.__audioInspector = inspector
    if (scheduler) {
      // Convenience wrappers to tweak scheduler behavior at runtime
      ;(inspector as any).getStartMode = () => scheduler.getStartMode()
      ;(inspector as any).setStartMode = (m: 'next-beat' | 'immediate') => scheduler.setStartMode(m)
    }
    return () => {
      delete window.__audioInspector
    }
  }, [scheduler, store])
}
