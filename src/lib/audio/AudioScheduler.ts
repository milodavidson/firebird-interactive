import { computeNextBeatScheduleTime, computeTargetOffsetForBeat, loopDuration, secondsPerBeat } from './audioUtils'
import type { AssignedInstrument, MusicalPart, Tempo } from '@/lib/types'
import { audioService } from './AudioService'

type MutableRef<T> = { current: T }

export class AudioScheduler {
  partsRef: MutableRef<MusicalPart[]>
  playStateRef: MutableRef<boolean>
  transportStartRef: MutableRef<number | null>
  currentTempoRef: MutableRef<Tempo>
  deferredQueueRef: MutableRef<AssignedInstrument[]>
  removedInstanceIdsRef: MutableRef<Set<string>>
  nodeStartTimesRef: MutableRef<Record<string, { soft?: number[]; loud?: number[] }>>
  private loopTimer: any = null
  private tempoSwitch: { targetTempo: Tempo; scheduleTime?: number } | null = null
  private setPartsCb?: (updater: (prev: MusicalPart[]) => MusicalPart[]) => void

  constructor(params: {
    partsRef: MutableRef<MusicalPart[]>
    playStateRef: MutableRef<boolean>
    transportStartRef: MutableRef<number | null>
    currentTempoRef: MutableRef<Tempo>
    deferredQueueRef: MutableRef<AssignedInstrument[]>
    removedInstanceIdsRef: MutableRef<Set<string>>
    nodeStartTimesRef: MutableRef<Record<string, { soft?: number[]; loud?: number[] }>>
    loopAnchorRef?: MutableRef<number | null>
    setParts?: (updater: (prev: MusicalPart[]) => MusicalPart[]) => void
  }) {
    this.partsRef = params.partsRef
    this.playStateRef = params.playStateRef
    this.transportStartRef = params.transportStartRef
    this.currentTempoRef = params.currentTempoRef
    this.deferredQueueRef = params.deferredQueueRef
    this.removedInstanceIdsRef = params.removedInstanceIdsRef
    this.nodeStartTimesRef = params.nodeStartTimesRef
    this.setPartsCb = params.setParts
    ;(this as any).loopAnchorRef = (params as any).loopAnchorRef || { current: null }
  }

  scheduleLoopStartIfNeeded() {
    const ctx = audioService.audioCtx
    if (!ctx) return
    const transportStart = this.transportStartRef.current
    if (transportStart == null) return
    const tempo = this.currentTempoRef.current
    const { nextBeatIndex, scheduleTime } = computeNextBeatScheduleTime(ctx.currentTime, transportStart, tempo)
  const spb = secondsPerBeat(tempo)
    // schedule all assigned instruments
    for (const part of this.partsRef.current) {
      for (const inst of part.assignedInstruments) {
        if (this.removedInstanceIdsRef.current.has(inst.id)) continue
        const bufs = audioService.getBuffersFor(inst.id, tempo)
        if (!bufs) continue
        const fadeMs = 15
        if (bufs.soft) {
          // At loop iteration boundaries, start from the beginning of the buffer to avoid cutting off the first beat
          const off = 0
          audioService.createAndStartNode(inst.id, bufs.soft, 'soft', scheduleTime, off, fadeMs)
          const entry = (this.nodeStartTimesRef.current[inst.id] ||= { soft: [], loud: [] })
          entry.soft!.push(scheduleTime)
        }
        if (bufs.loud) {
          const off = 0
          audioService.createAndStartNode(inst.id, bufs.loud, 'loud', scheduleTime, off, fadeMs)
          const entry2 = (this.nodeStartTimesRef.current[inst.id] ||= { soft: [], loud: [] })
          entry2.loud!.push(scheduleTime)
        }
      }
    }

  // Update loop anchor so UI can reference audible start time
  ;(this as any).loopAnchorRef.current = scheduleTime

  // schedule processing of deferred queue exactly at scheduleTime
    const delayMs = Math.max(0, (scheduleTime - ctx.currentTime) * 1000)
    setTimeout(() => this.processDeferredQueueAtBeat(nextBeatIndex, scheduleTime), delayMs)

    // schedule next loop
    const lead = 0.02
    const loopT = scheduleTime + loopDuration(tempo) - lead
    const nextDelayMs = Math.max(0, (loopT - ctx.currentTime) * 1000)
    this.loopTimer = setTimeout(() => this.scheduleLoopStartIfNeeded(), nextDelayMs)
  }

  async processDeferredQueueAtBeat(beatIndex: number, scheduleTime: number) {
    const tempo = this.currentTempoRef.current
    const ctx = audioService.audioCtx
    if (!ctx) return
    const q = this.deferredQueueRef.current.slice()
    this.deferredQueueRef.current = []
    for (const inst of q) {
      if (this.removedInstanceIdsRef.current.has(inst.id)) continue
      const partId = this.partsRef.current.find(p => p.assignedInstruments.some(ai => ai.id === inst.id))?.id
      if (!partId) continue
      await audioService.preloadTempoForInstance(inst.id, partId, inst.instrumentId, tempo)
      const bufs = audioService.getBuffersFor(inst.id, tempo)
      if (!bufs) continue
      const fadeMs = 15
      if (bufs.soft) {
        const off = computeTargetOffsetForBeat(beatIndex, tempo, bufs.soft.duration)
        audioService.createAndStartNode(inst.id, bufs.soft, 'soft', scheduleTime, off, fadeMs)
        const e = (this.nodeStartTimesRef.current[inst.id] ||= { soft: [], loud: [] })
        e.soft!.push(scheduleTime)
      }
      if (bufs.loud) {
        const off = computeTargetOffsetForBeat(beatIndex, tempo, bufs.loud.duration)
        audioService.createAndStartNode(inst.id, bufs.loud, 'loud', scheduleTime, off, fadeMs)
        const e2 = (this.nodeStartTimesRef.current[inst.id] ||= { soft: [], loud: [] })
        e2.loud!.push(scheduleTime)
      }
      // flip isLoading off in UI when scheduled
      if (this.setPartsCb) {
        this.setPartsCb(prev => prev.map(p => ({
          ...p,
          assignedInstruments: p.assignedInstruments.map(ai => ai.id === inst.id ? { ...ai, isLoading: false, queueTimeRemaining: undefined, queueStartTime: undefined } : ai)
        })))
      }
    }
  }

  async scheduleTempoSwitch(targetTempo: Tempo) {
    const ctx = audioService.audioCtx
    if (!ctx) return
    // preload for all assigned and queued
    const parts = this.partsRef.current
    await Promise.all(
      parts.flatMap(p =>
        p.assignedInstruments.map(inst => audioService.preloadTempoForInstance(inst.id, p.id, inst.instrumentId, targetTempo))
      )
    )
    await Promise.all(
      this.deferredQueueRef.current.map(inst => {
        const partId = parts.find(p => p.assignedInstruments.some(ai => ai.id === inst.id))?.id
        return partId ? audioService.preloadTempoForInstance(inst.id, partId, inst.instrumentId, targetTempo) : Promise.resolve()
      })
    )
    // compute next beat on current grid
    const transportStart = this.transportStartRef.current
    if (transportStart == null) return
    const currentTempo = this.currentTempoRef.current
    const { nextBeatIndex, scheduleTime } = computeNextBeatScheduleTime(ctx.currentTime, transportStart, currentTempo)
    this.tempoSwitch = { targetTempo, scheduleTime }
    const delayMs = Math.max(0, (scheduleTime - ctx.currentTime) * 1000)
    setTimeout(() => {
      // guard against duplicate execution
      if (!this.tempoSwitch || this.tempoSwitch.scheduleTime !== scheduleTime || this.tempoSwitch.targetTempo !== targetTempo) return
      // At schedule, start new nodes at target tempo and fade old ones
      for (const p of parts) {
        for (const inst of p.assignedInstruments) {
          const newBufs = audioService.getBuffersFor(inst.id, targetTempo)
          const fadeMs = Math.min(60, secondsPerBeat(targetTempo) * 1000)
          // First, fade out any existing nodes at scheduleTime to avoid clobbering the new ones
          audioService.fadeAndStopNode(inst.id, 'soft', scheduleTime, fadeMs)
          audioService.fadeAndStopNode(inst.id, 'loud', scheduleTime, fadeMs)
          if (newBufs?.soft) {
            const off = computeTargetOffsetForBeat(nextBeatIndex, targetTempo, newBufs.soft.duration)
            audioService.createAndStartNode(inst.id, newBufs.soft, 'soft', scheduleTime, off, fadeMs)
          }
          if (newBufs?.loud) {
            const off = computeTargetOffsetForBeat(nextBeatIndex, targetTempo, newBufs.loud.duration)
            audioService.createAndStartNode(inst.id, newBufs.loud, 'loud', scheduleTime, off, fadeMs)
          }
        }
      }
      // Update tempo and re-anchor transport start so beat index continuity holds
      this.currentTempoRef.current = targetTempo
      const spbTarget = secondsPerBeat(targetTempo)
      this.transportStartRef.current = scheduleTime - nextBeatIndex * spbTarget
      this.tempoSwitch = null
    }, delayMs)
  }

  getScheduledTempoSwitch() {
    return this.tempoSwitch
  }

  stop() {
    if (this.loopTimer) {
      clearTimeout(this.loopTimer)
      this.loopTimer = null
    }
  }
}
