'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePartsStore } from '@/hooks/usePartsStore'
import { audioService } from '@/lib/audio/AudioService'
import { secondsPerBeat, loopDuration, computeCurrentBeatIndex } from '@/lib/audio/audioUtils'
import type { Tempo } from '@/lib/types'
import type { AudioScheduler } from '@/lib/audio/AudioScheduler'

function beatInLoop(beatIndex: number, tempo: Tempo) {
  const spb = secondsPerBeat(tempo)
  const bpl = Math.round(loopDuration(tempo) / spb)
  const mod = ((beatIndex % bpl) + bpl) % bpl
  return { beatInLoop: mod, beatsPerLoop: bpl }
}

export default function BeatDebug({ scheduler }: { scheduler?: AudioScheduler }) {
  const store = usePartsStore()
  const [now, setNow] = useState<number>(0)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const ctx = audioService.audioCtx
      setNow(ctx ? ctx.currentTime : 0)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const data = useMemo(() => {
    const tempo = store.currentTempoRef.current
    const playing = store.playStateRef.current
    // use audible loop anchor rather than nominal transport start
    const transport = (store as any).loopAnchorRef?.current ?? store.transportStartRef.current
    const spb = secondsPerBeat(tempo)
    let currentBeat = null as number | null
    if (playing && transport != null) {
      currentBeat = computeCurrentBeatIndex(now, transport, tempo)
    }

    const sched = scheduler?.getScheduledTempoSwitch() || null
    let nextBeatIdx = null as number | null
    let targetBeatIdx = null as number | null
    let targetTempo: Tempo | null = null
    let etaMs = null as number | null
    let currentInLoop: { beatInLoop: number; beatsPerLoop: number } | null = null
    let targetInLoop: { beatInLoop: number; beatsPerLoop: number } | null = null

    if (playing && transport != null) {
      // what would be the next beat on current grid
      nextBeatIdx = Math.floor((now - transport) / spb) + 1
      currentInLoop = beatInLoop(nextBeatIdx, tempo)
    }
    if (sched && sched.scheduleTime && playing && transport != null) {
      targetTempo = sched.targetTempo
      targetBeatIdx = nextBeatIdx
      const tspb = secondsPerBeat(targetTempo)
      targetInLoop = targetBeatIdx != null ? beatInLoop(targetBeatIdx, targetTempo) : null
      etaMs = Math.max(0, sched.scheduleTime - now) * 1000
    }

    return { tempo, now, spb, currentBeat, nextBeatIdx, currentInLoop, targetTempo, targetBeatIdx, targetInLoop, etaMs }
  }, [now, scheduler, store])

  return (
    <div style={{ marginTop: 8, padding: 8, border: '1px dashed #ccc', borderRadius: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Beat Debug</div>
      <div>
        Now: tempo=<strong>{usePartsStore.getState().tempo}</strong>, currentBeat={data.currentBeat ?? '-'}
      </div>
      <div>
        Next beat (current grid): {data.nextBeatIdx ?? '-'}
        {data.currentInLoop && (
          <span> (in-loop {data.currentInLoop.beatInLoop + 1})</span>
        )}
      </div>
      <div>
        Scheduled switch: {data.targetTempo ?? '-'} {data.etaMs != null ? `(in ${Math.round(data.etaMs)}ms)` : ''}
      </div>
      <div>
        Target beat on switch: {data.targetBeatIdx ?? '-'}
        {data.targetInLoop && (
          <span> (in-loop {data.targetInLoop.beatInLoop + 1})</span>
        )}
      </div>
    </div>
  )
}
