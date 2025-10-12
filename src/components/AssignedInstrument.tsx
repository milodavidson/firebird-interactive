'use client'

import { useEffect, useState } from 'react'
import type { AssignedInstrument as AssignedInstrumentType } from '@/lib/types'
import { audioService } from '@/lib/audio/AudioService'
import { usePartsStore } from '@/hooks/usePartsStore'
import { Headphones, Volume2, VolumeX, Trash2 } from 'lucide-react'
import { useAssignments } from '@/hooks/useAssignments'

export default function AssignedInstrument({ inst }: { inst: AssignedInstrumentType }) {
  const { soloInstanceId, setParts, setSoloInstanceId, parts } = usePartsStore()
  const isSoloed = soloInstanceId === inst.id
  const { removeInstrument } = useAssignments()
  // Keep base gains in sync with UI state (solo/mute/balance)
  useEffect(() => {
    const effectiveMuted = (soloInstanceId ? inst.id !== soloInstanceId : false) || inst.isMuted
    audioService.setBaseGainValues(inst.id, inst.volumeBalance, effectiveMuted)
  }, [soloInstanceId, inst.id, inst.isMuted, inst.volumeBalance])

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
            const effectiveMuted = (soloInstanceId ? inst.id !== soloInstanceId : false) || inst.isMuted
            audioService.setBaseGainValues(inst.id, val, effectiveMuted)
            setParts(prev => prev.map(p => ({ ...p, assignedInstruments: p.assignedInstruments.map(ai => (ai.id === inst.id ? { ...ai, volumeBalance: val } : ai)) })))
          }}
        />
        <button data-testid="solo-toggle"
          aria-label={isSoloed ? 'Unsolo' : 'Solo'}
          aria-pressed={isSoloed}
          className={`btn ${isSoloed ? 'bg-[var(--color-brand-navy)] text-white border border-[var(--color-brand-navy)]' : 'btn-outline'}`}
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
          <Headphones size={16} />
        </button>
        <button data-testid="mute-toggle"
          aria-label={inst.isMuted ? 'Unmute' : 'Mute'}
          aria-pressed={inst.isMuted}
          className={`btn ${inst.isMuted ? 'bg-[var(--color-brand-red)] text-white border border-[var(--color-brand-red)]' : 'btn-outline'}`}
          onClick={() => {
            const nextMuted = !inst.isMuted
            // Update state
            setParts(prev => prev.map(p => ({ ...p, assignedInstruments: p.assignedInstruments.map(ai => (ai.id === inst.id ? { ...ai, isMuted: nextMuted } : ai)) })))
            // Recompute gains for all instruments based on solo and per-inst mute
            const all = parts.flatMap(p => p.assignedInstruments)
            for (const ai of all) {
              const aiMuted = ai.id === inst.id ? nextMuted : ai.isMuted
              const effectiveMuted = (soloInstanceId ? ai.id !== soloInstanceId : false) || aiMuted
              audioService.setBaseGainValues(ai.id, ai.volumeBalance, effectiveMuted)
            }
          }}
        >
          {inst.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <button
          aria-label={`Remove ${inst.name}`}
          className="btn btn-outline"
          title={`Remove ${inst.name}`}
          onClick={() => removeInstrument(inst.id)}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

function QueuedProgress({ scheduleTime, startTime }: { scheduleTime: number; startTime: number }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const ctx = audioService.audioCtx
      if (!ctx) {
        setPct(0)
        raf = requestAnimationFrame(tick)
        return
      }
      const now = ctx.currentTime
      const total = Math.max(0.001, scheduleTime - startTime)
      const elapsed = Math.max(0, now - startTime)
      const p = Math.min(1, elapsed / total)
      setPct(Math.round(p * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scheduleTime, startTime])
  return (
    <span aria-label="Queued" title="Queued" data-testid="queued-progress" style={{ display: 'inline-block', width: 60, height: 6, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
      <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: '#999' }} />
    </span>
  )
}
