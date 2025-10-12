import { computeNextBeatScheduleTime, computeTargetOffsetForBeat, loopDuration, secondsPerBeat, computeWithinLoopBeat, beatsPerLoop, computeNextLoopScheduleTime, computeWithinLoopBeatAtTime } from './audioUtils'
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
  nodeStartTimesRef: MutableRef<Record<string, { soft?: number[]; loud?: number[]; beatIndex?: number[] }>>
  private loopTimer: any = null
  private tempoSwitch: { targetTempo: Tempo; scheduleTime?: number; withinBeatTarget?: number; withinBeatTargetCorrected?: number } | null = null
  private lastTempoSwitchExec: { scheduleTime: number; withinBeatCur: number; withinBeatUsed: number } | null = null
  private switchCount = 0
  private postSwitchBeatCorrection = 0 // 0 by default; can be set to +1/-1 via inspector
  private startMode: 'next-beat' | 'immediate' = 'immediate'
  private hasStarted = false
  private setPartsCb?: (updater: (prev: MusicalPart[]) => MusicalPart[]) => void

  constructor(params: {
    partsRef: MutableRef<MusicalPart[]>
    playStateRef: MutableRef<boolean>
    transportStartRef: MutableRef<number | null>
    currentTempoRef: MutableRef<Tempo>
    deferredQueueRef: MutableRef<AssignedInstrument[]>
    removedInstanceIdsRef: MutableRef<Set<string>>
  nodeStartTimesRef: MutableRef<Record<string, { soft?: number[]; loud?: number[]; beatIndex?: number[] }>>
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
  }

  scheduleLoopStartIfNeeded() {
    const ctx = audioService.audioCtx
    if (!ctx) return
    const transportStart = this.transportStartRef.current
    if (transportStart == null) return
    const tempo = this.currentTempoRef.current
    let nextBeatIndex: number
    let scheduleTime: number
    if (!this.hasStarted && this.startMode === 'immediate') {
      // First start: schedule immediately with a tiny lead and anchor transport to audible start
      const lead = 0.02
      scheduleTime = ctx.currentTime + lead
      nextBeatIndex = 1
      this.transportStartRef.current = scheduleTime
      this.hasStarted = true
    } else if (this.startMode === 'next-beat' && !this.hasStarted) {
      // First start at next beat boundary
      const r = computeNextBeatScheduleTime(ctx.currentTime, transportStart, tempo)
      nextBeatIndex = r.nextBeatIndex
      scheduleTime = r.scheduleTime
      this.hasStarted = true
    } else {
      // Subsequent loop starts: schedule exactly at the next loop boundary on the anchored grid
      const { nextLoopBeatIndex, scheduleTime: loopStart } = computeNextLoopScheduleTime(
        ctx.currentTime,
        this.transportStartRef.current!,
        tempo
      )
      scheduleTime = loopStart
      // Convert 0-based absolute beat count at loop start to 1-based absolute index
      // so that within-loop mapping at a loop boundary resolves to beat 1 (offset 0).
      nextBeatIndex = nextLoopBeatIndex + 1
    }
    try {
      // eslint-disable-next-line no-console
      console.log('[LoopStart]', { now: ctx.currentTime, transportStart, tempo, nextBeatIndex, scheduleTime })
    } catch {}
    // schedule all assigned instruments
    for (const part of this.partsRef.current) {
      for (const inst of part.assignedInstruments) {
        // If an instrument is queued for this upcoming loop boundary, let the queue processor start it
        if ((inst as any).isLoading) continue
        if (this.removedInstanceIdsRef.current.has(inst.id)) continue
        const bufs = audioService.getBuffersFor(inst.id, tempo)
        if (!bufs) continue
        const fadeMs = 15
        if (bufs.soft) {
          // First entry on a loop iteration: start buffer at head to ensure the downbeat is heard
          const off = 0
          audioService.createAndStartNode(inst.id, bufs.soft, 'soft', scheduleTime, off, fadeMs)
          const entry = (this.nodeStartTimesRef.current[inst.id] ||= { soft: [], loud: [], beatIndex: [] })
          entry.soft!.push(scheduleTime)
          entry.beatIndex!.push(nextBeatIndex)
        }
        if (bufs.loud) {
          const off = 0
          audioService.createAndStartNode(inst.id, bufs.loud, 'loud', scheduleTime, off, fadeMs)
          const entry2 = (this.nodeStartTimesRef.current[inst.id] ||= { soft: [], loud: [], beatIndex: [] })
          entry2.loud!.push(scheduleTime)
          entry2.beatIndex!.push(nextBeatIndex)
        }
      }
    }

    // schedule processing of deferred queue exactly at scheduleTime
  const delayMs = Math.max(0, (scheduleTime - ctx.currentTime) * 1000)
    setTimeout(() => this.processDeferredQueueAtBeat(nextBeatIndex, scheduleTime), delayMs)

  // schedule next loop aligned to the loop we just started: next start = scheduleTime + loopDuration
  // Using transportStart-based loop grid here causes the very first loop to be one beat short when
  // the initial start happens at the next beat boundary; anchoring to scheduleTime fixes that.
  const early = 0.05
  const nextLoopStart = scheduleTime + loopDuration(tempo)
  const fireAt = nextLoopStart - early
  const nextDelayMs = Math.max(0, (fireAt - ctx.currentTime) * 1000)
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
        try { console.log('[QueueProcess] soft', { instId: inst.id, beatIndex, tempo, scheduleTime, off }) } catch {}
        audioService.createAndStartNode(inst.id, bufs.soft, 'soft', scheduleTime, off, fadeMs)
  const e = (this.nodeStartTimesRef.current[inst.id] ||= { soft: [], loud: [], beatIndex: [] })
        e.soft!.push(scheduleTime)
  e.beatIndex!.push(beatIndex)
      }
      if (bufs.loud) {
        const off = computeTargetOffsetForBeat(beatIndex, tempo, bufs.loud.duration)
        try { console.log('[QueueProcess] loud', { instId: inst.id, beatIndex, tempo, scheduleTime, off }) } catch {}
        audioService.createAndStartNode(inst.id, bufs.loud, 'loud', scheduleTime, off, fadeMs)
  const e2 = (this.nodeStartTimesRef.current[inst.id] ||= { soft: [], loud: [], beatIndex: [] })
        e2.loud!.push(scheduleTime)
  e2.beatIndex!.push(beatIndex)
      }
  // flip isLoading off in UI when scheduled; loop start will not schedule these because isLoading was true at scheduling time
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
  const { nextBeatIndex: nextBeatIndexGlobal, scheduleTime } = computeNextBeatScheduleTime(ctx.currentTime, transportStart, currentTempo)
  // Map the absolute next beat to a 1-based within-loop beat on the current grid
  const withinBeatCur = computeWithinLoopBeat(nextBeatIndexGlobal, currentTempo)
  const nextWithinBeatCur = withinBeatCur
    try { console.log('[TempoSwitch][scheduleRequest]', { now: ctx.currentTime, transportStart, currentTempo, targetTempo, nextBeatIndexGlobal, withinBeatCur, nextWithinBeatCur, scheduleTime }) } catch {}
  // Precompute a corrected target for transparency (auto + user correction)
  const autoCorr = this.startMode === 'immediate' ? 1 : (this.switchCount >= 1 ? 1 : 0)
  const bplT = beatsPerLoop(targetTempo)
  const correctedPreview = ((withinBeatCur - 1 + ((autoCorr % bplT) + bplT) % bplT) % bplT) + 1
  this.tempoSwitch = { targetTempo, scheduleTime, withinBeatTarget: withinBeatCur, withinBeatTargetCorrected: correctedPreview }
    const delayMs = Math.max(0, (scheduleTime - ctx.currentTime) * 1000)
    setTimeout(() => {
      // guard against duplicate execution
      if (!this.tempoSwitch || this.tempoSwitch.scheduleTime !== scheduleTime || this.tempoSwitch.targetTempo !== targetTempo) return
      // At schedule, start new nodes at target tempo and fade old ones
      try {
        const bplCur = beatsPerLoop(currentTempo)
        const bplTgt = beatsPerLoop(targetTempo)
        // eslint-disable-next-line no-console
        console.log('[TempoSwitch][execute]', {
          nextBeatIndexGlobal,
          withinBeatCur,
          scheduleTime,
          currentTempo,
          targetTempo,
          beatsPerLoopCur: bplCur,
          beatsPerLoopTgt: bplTgt
        })
      } catch {}
      // Apply optional post-switch correction after the first switch
  const bplTarget = beatsPerLoop(targetTempo)
  const autoCorrExec = this.startMode === 'immediate' ? 1 : (this.switchCount >= 1 ? 1 : 0)
  const correction = autoCorrExec + this.postSwitchBeatCorrection
      const withinBeatUsed = ((withinBeatCur - 1 + ((correction % bplTarget) + bplTarget) % bplTarget) % bplTarget) + 1
      try {
        console.log('[TempoSwitch][correction]', { switchCount: this.switchCount, postSwitchBeatCorrection: this.postSwitchBeatCorrection, withinBeatCur, withinBeatUsed, targetTempo })
      } catch {}
      for (const p of parts) {
        for (const inst of p.assignedInstruments) {
          const newBufs = audioService.getBuffersFor(inst.id, targetTempo)
          const fadeMs = Math.min(60, secondsPerBeat(targetTempo) * 1000)
          // First, fade out any existing nodes at scheduleTime to avoid clobbering the new ones
          audioService.fadeAndStopNode(inst.id, 'soft', scheduleTime, fadeMs)
          audioService.fadeAndStopNode(inst.id, 'loud', scheduleTime, fadeMs)
          if (newBufs?.soft) {
            const off = computeTargetOffsetForBeat(withinBeatUsed, targetTempo, newBufs.soft.duration)
            // eslint-disable-next-line no-console
            try { console.log('[TempoSwitch] soft', { instId: inst.id, off, dur: newBufs.soft.duration }) } catch {}
            audioService.createAndStartNode(inst.id, newBufs.soft, 'soft', scheduleTime, off, fadeMs)
          }
          if (newBufs?.loud) {
            const off = computeTargetOffsetForBeat(withinBeatUsed, targetTempo, newBufs.loud.duration)
            // eslint-disable-next-line no-console
            try { console.log('[TempoSwitch] loud', { instId: inst.id, off, dur: newBufs.loud.duration }) } catch {}
            audioService.createAndStartNode(inst.id, newBufs.loud, 'loud', scheduleTime, off, fadeMs)
          }
        }
      }
      // Update tempo and re-anchor transport start so beat index continuity holds
      this.currentTempoRef.current = targetTempo
      const spbTarget = secondsPerBeat(targetTempo)
  // Anchor so that at scheduleTime, the in-loop beat equals withinBeatCur (1-based) on the target grid.
  // computeCurrentBeatIndex + 1 should equal withinBeatCur at scheduleTime, hence subtract (withinBeatCur - 1) beats.
      this.transportStartRef.current = scheduleTime - (withinBeatUsed - 1) * spbTarget
      try { console.log('[TempoSwitch][anchor]', { scheduleTime, spbTarget, withinBeatCur, withinBeatUsed, transportStart: this.transportStartRef.current }) } catch {}
      this.lastTempoSwitchExec = { scheduleTime, withinBeatCur, withinBeatUsed }

      // Reset loop timer to the next loop boundary on the new grid so old timers don't misfire
      if (this.loopTimer) {
        clearTimeout(this.loopTimer)
        this.loopTimer = null
      }
      const lead = 0.02
      const { scheduleTime: nextLoopOnNewGrid } = computeNextLoopScheduleTime(ctx.currentTime, this.transportStartRef.current!, targetTempo)
      const fireAt = nextLoopOnNewGrid - lead
      const delayMs = Math.max(0, (fireAt - ctx.currentTime) * 1000)
      try { console.log('[TempoSwitch][resetLoopTimer]', { nextLoopOnNewGrid, fireAt, delayMs }) } catch {}
      this.loopTimer = setTimeout(() => this.scheduleLoopStartIfNeeded(), delayMs)

      // Post-check: log within-beat at +1 and +2 target beats after the switch to ensure proper progression
      const spbT = secondsPerBeat(targetTempo)
      const t1 = scheduleTime + spbT
      const t2 = scheduleTime + 2 * spbT
      const post1Delay = Math.max(0, (t1 - ctx.currentTime) * 1000)
      const post2Delay = Math.max(0, (t2 - ctx.currentTime) * 1000)
      setTimeout(() => {
        try {
          const wb1 = computeWithinLoopBeatAtTime(t1, this.transportStartRef.current!, targetTempo)
          console.log('[TempoSwitch][postCheck]', { at: '+1 beat', time: t1, withinBeat: wb1, expected: ((withinBeatCur % beatsPerLoop(targetTempo)) + 1) % beatsPerLoop(targetTempo) || beatsPerLoop(targetTempo) })
        } catch {}
      }, post1Delay)
      setTimeout(() => {
        try {
          const wb2 = computeWithinLoopBeatAtTime(t2, this.transportStartRef.current!, targetTempo)
          const bpl = beatsPerLoop(targetTempo)
          const exp2 = ((withinBeatCur - 1 + 2) % bpl) + 1
          console.log('[TempoSwitch][postCheck]', { at: '+2 beats', time: t2, withinBeat: wb2, expected: exp2 })
        } catch {}
      }, post2Delay)
      this.tempoSwitch = null
      this.switchCount += 1
    }, delayMs)
  }

  getScheduledTempoSwitch() {
    return this.tempoSwitch
  }

  getLastTempoSwitchExecution() {
    return this.lastTempoSwitchExec
  }

  setPostSwitchBeatCorrection(n: number) {
    if (!Number.isFinite(n)) return
    this.postSwitchBeatCorrection = Math.trunc(n)
  }

  stop() {
    if (this.loopTimer) {
      clearTimeout(this.loopTimer)
      this.loopTimer = null
    }
    this.hasStarted = false
  }

  getPostSwitchBeatCorrection() {
    return this.postSwitchBeatCorrection
  }

  setStartMode(mode: 'next-beat' | 'immediate') {
    this.startMode = mode
    try { console.log('[LoopStart][mode]', { startMode: this.startMode }) } catch {}
  }

  getStartMode() { return this.startMode }

  // stop() is implemented above to also reset hasStarted
}
