'use client'

import { useEffect } from 'react'
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
      getTempo: () => store.currentTempoRef.current
    }

    Object.defineProperty(inspector, 'scheduledTempoSwitch', {
      get() {
        return scheduler ? scheduler.getScheduledTempoSwitch() : null
      },
      enumerable: true
    })

    window.__audioInspector = inspector
    return () => {
      delete window.__audioInspector
    }
  }, [scheduler, store])
}
