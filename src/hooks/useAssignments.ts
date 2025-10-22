'use client'

import { useCallback } from 'react'
import { usePartsStore } from './usePartsStore'
import type { PartId, AssignedInstrument } from '@/lib/types'
import { audioService } from '@/lib/audio/AudioService'
import { computeNextLoopScheduleTime } from '@/lib/audio/audioUtils'

export function useAssignments() {
  const store = usePartsStore()
  const addInstrument = useCallback(
    async (partId: PartId, instrumentId: string, name: string): Promise<string | void> => {
      const instId = `${partId}-${instrumentId}-${Date.now()}`
      const tempo = store.currentTempoRef.current
      const softFile = `/audio/${partId}/${instrumentId}-p-${tempo}.mp3`
      const loudFile = `/audio/${partId}/${instrumentId}-f-${tempo}.mp3`
      const assigned: AssignedInstrument = {
        id: instId,
        instrumentId,
        name,
        softFile,
        loudFile,
        volumeBalance: 0,
        isMuted: false
      }

      // prevent duplicates per part by instrumentId
      const part = store.partsRef.current.find(p => p.id === partId)!
      if (part.assignedInstruments.some(ai => ai.instrumentId === instrumentId)) return

  if (!store.playStateRef.current) {
        // idle: preload both tempos and add directly
        await Promise.all([
          audioService.preloadTempoForInstance(instId, partId, instrumentId, 'fast'),
          audioService.preloadTempoForInstance(instId, partId, instrumentId, 'slow')
        ])
        // detect missing audio for current tempo
        const bufs = audioService.getBuffersFor(instId, store.currentTempoRef.current)
        const hasError = !bufs?.soft || !bufs?.loud
        store.setParts(prev =>
          prev.map(p => (p.id === partId ? { ...p, assignedInstruments: [...p.assignedInstruments, { ...assigned, hasError }] } : p))
        )
        return instId
      } else {
        // playing: mark queued and push to deferredQueueRef
        audioService.initIfNeeded()
    const ctx = audioService.audioCtx!
    const transport = store.transportStartRef.current!
    const { scheduleTime } = computeNextLoopScheduleTime(ctx.currentTime, transport, store.currentTempoRef.current)
    const remaining = Math.max(0, scheduleTime - ctx.currentTime)
    const queued = { ...assigned, isLoading: true, queueStartTime: ctx.currentTime, queueTimeRemaining: remaining, queueScheduleTime: scheduleTime }
  store.setParts(prev => prev.map(p => (p.id === partId ? { ...p, assignedInstruments: [...p.assignedInstruments, queued] } : p)))
        store.deferredQueueRef.current = [...store.deferredQueueRef.current, queued]
        // preload current tempo first
        await audioService.preloadTempoForInstance(instId, partId, instrumentId, store.currentTempoRef.current)
        // preload other tempo in background
        audioService.preloadTempoForInstance(instId, partId, instrumentId, store.currentTempoRef.current === 'fast' ? 'slow' : 'fast')
        return instId
      }
    },
    [store]
  )

  const removeInstrument = useCallback(
    (instId: string) => {
      store.removedInstanceIdsRef.current.add(instId)
      store.setParts(prev => prev.map(p => ({ ...p, assignedInstruments: p.assignedInstruments.filter(ai => ai.id !== instId) })))
      // stop audio
      audioService.stopAndCleanupNode(instId, 'soft')
      audioService.stopAndCleanupNode(instId, 'loud')
      audioService.releaseInstance(instId)
    },
    [store]
  )

  return { addInstrument, removeInstrument }
}
