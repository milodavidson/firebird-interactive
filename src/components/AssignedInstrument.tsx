'use client'

import type { AssignedInstrument as AssignedInstrumentType } from '@/lib/types'
import { audioService } from '@/lib/audio/AudioService'
import { usePartsStore } from '@/hooks/usePartsStore'

export default function AssignedInstrument({ inst }: { inst: AssignedInstrumentType }) {
  const { soloInstanceId, setParts, setSoloInstanceId, parts } = usePartsStore()
  const isSoloed = soloInstanceId === inst.id

  return (
    <div data-inst-id={inst.id} data-queued={!!inst.isLoading}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span data-testid="inst-name">{inst.name} {inst.hasError ? '(File missing)' : ''}</span>
        {inst.isLoading && inst.queueScheduleTime != null && inst.queueStartTime != null && (
          <QueuedProgress scheduleTime={inst.queueScheduleTime} startTime={inst.queueStartTime} />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <label style={{ fontSize: 12 }}>Balance</label>
        <input
          type="range"
          min={0}
          max={100}
          value={inst.volumeBalance}
          onChange={e => {
            const val = Number(e.target.value)
            audioService.setBaseGainValues(inst.id, val, inst.isMuted)
            setParts(prev => prev.map(p => ({ ...p, assignedInstruments: p.assignedInstruments.map(ai => (ai.id === inst.id ? { ...ai, volumeBalance: val } : ai)) })))
          }}
        />
        <button data-testid="solo-toggle"
          onClick={() => {
            const nextSolo = isSoloed ? null : inst.id
            setSoloInstanceId(nextSolo)
            // Update base gains mute state for all instruments based on solo
            const all = parts.flatMap(p => p.assignedInstruments)
            for (const ai of all) {
              const muted = nextSolo ? ai.id !== nextSolo : ai.isMuted
              audioService.setBaseGainValues(ai.id, ai.volumeBalance, muted)
            }
          }}
        >
          {isSoloed ? 'Unsolo' : 'Solo'}
        </button>
        <button data-testid="mute-toggle"
          onClick={() => setParts(prev => prev.map(p => ({ ...p, assignedInstruments: p.assignedInstruments.map(ai => (ai.id === inst.id ? { ...ai, isMuted: !ai.isMuted } : ai)) })))}
        >
          {inst.isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  )
}

function QueuedProgress({ scheduleTime, startTime }: { scheduleTime: number; startTime: number }) {
  const pct = (() => {
    const ctx = audioService.audioCtx
    if (!ctx) return 0
    const now = ctx.currentTime
    const total = Math.max(0.001, scheduleTime - startTime)
    const elapsed = Math.max(0, now - startTime)
    const p = Math.min(1, elapsed / total)
    return Math.round(p * 100)
  })()
  return (
    <span aria-label="Queued" title="Queued" data-testid="queued-progress" style={{ display: 'inline-block', width: 60, height: 6, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
      <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: '#999' }} />
    </span>
  )
}
