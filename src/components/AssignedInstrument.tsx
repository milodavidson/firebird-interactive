"use client"

import { useEffect, useState, useRef } from 'react'
import type { AssignedInstrument as AssignedInstrumentType } from '@/lib/types'
import { audioService } from '@/lib/audio/AudioService'
import { usePartsStore } from '@/hooks/usePartsStore'
import { Headphones, Volume2, VolumeX, Trash2 } from 'lucide-react'
import { useAssignments } from '@/hooks/useAssignments'
import * as Tooltip from '@radix-ui/react-tooltip'

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
  <div data-inst-id={inst.id} data-queued={!!inst.isLoading} className="relative flex flex-wrap xl:flex-nowrap items-center gap-x-1.5 lg:gap-x-2 gap-y-1 pt-2 pb-1">
      {inst.isLoading && inst.queueScheduleTime != null && inst.queueStartTime != null && (
        <QueuedStrip scheduleTime={inst.queueScheduleTime} startTime={inst.queueStartTime} />
      )}
      {/* Icon/name block */}
      <div className="flex min-w-0 items-center gap-2 order-1">
        <InstrumentFamilyIcon instrumentId={inst.instrumentId} />
        <span className="sr-only" data-testid="inst-name">{inst.name}{inst.hasError ? ' (File missing)' : ''}</span>
      </div>
      {/* Controls block */}
      <div className="ml-auto flex items-center gap-1 md:gap-1.5 shrink-0 order-2 lg:order-3">
        <Tooltip.Provider>
          <Tooltip.Root delayDuration={250}>
            <Tooltip.Trigger asChild>
              <button
                data-testid="solo-toggle"
                aria-label={isSoloed ? 'Unsolo' : 'Solo'}
                aria-pressed={isSoloed}
                className={`btn pressable px-1.5 py-1 text-[11px] md:px-2.5 md:py-1.5 md:text-sm ${isSoloed ? 'bg-[var(--color-brand-navy)] text-white border border-[var(--color-brand-navy)]' : 'btn-outline'}`}
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
                <Headphones size={14} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content sideOffset={6} className="rounded bg-black/90 px-2 py-1 text-xs text-white shadow">
                {isSoloed ? 'Unsolo' : 'Solo'}
                <Tooltip.Arrow className="fill-black/90" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <Tooltip.Root delayDuration={250}>
            <Tooltip.Trigger asChild>
              <button
                data-testid="mute-toggle"
                aria-label={inst.isMuted ? 'Unmute' : 'Mute'}
                aria-pressed={inst.isMuted}
                className={`btn pressable px-1.5 py-1 text-[11px] md:px-2.5 md:py-1.5 md:text-sm ${inst.isMuted ? 'bg-[var(--color-brand-red)] text-white border border-[var(--color-brand-red)]' : 'btn-outline'}`}
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
                {inst.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content sideOffset={6} className="rounded bg-black/90 px-2 py-1 text-xs text-white shadow">
                {inst.isMuted ? 'Unmute' : 'Mute'}
                <Tooltip.Arrow className="fill-black/90" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
          <Tooltip.Root delayDuration={250}>
            <Tooltip.Trigger asChild>
              <button
                aria-label={`Remove ${inst.name}`}
                className="btn btn-outline pressable px-1.5 py-1 text-[11px] md:px-2.5 md:py-1.5 md:text-sm"
                onClick={() => removeInstrument(inst.id)}
              >
                <Trash2 size={14} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content sideOffset={6} className="rounded bg-black/90 px-2 py-1 text-xs text-white shadow">
                Remove
                <Tooltip.Arrow className="fill-black/90" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
      {/* Compact slider (wraps under on small screens) */}
      <input
        aria-label={`${inst.name} balance`}
  className="order-last basis-full w-full xl:order-2 xl:basis-auto xl:w-auto ml-0 xl:ml-2 h-2 min-w-[80px] flex-1 xl:min-w-[140px] xl:max-w-[200px]"
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
    </div>
  )
}

function InstrumentFamilyIcon({ instrumentId }: { instrumentId: string }) {
  let src = ''
  let alt = ''
  switch (instrumentId) {
    case 'woodwind':
      src = '/icons/woodwind.png'; alt = 'Flute icon'; break
    case 'brass':
      src = '/icons/brass.png'; alt = 'Horn icon'; break
    case 'percussion':
      src = '/icons/percussion.png'; alt = 'Percussion icon'; break
    case 'strings':
      src = '/icons/strings.png'; alt = 'Violin icon'; break
    default:
      return null
  }
  return <img src={src} alt={alt} className="h-6 w-auto min-w-[24px] max-w-none select-none shrink-0 flex-none object-contain" draggable={false} />
}

function QueuedProgress({ scheduleTime, startTime, small }: { scheduleTime: number; startTime: number; small?: boolean }) {
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const ctx = audioService.audioCtx
      if (!ctx) {
        setP(0)
        raf = requestAnimationFrame(tick)
        return
      }
      const now = ctx.currentTime
      const total = Math.max(0.001, scheduleTime - startTime)
      const elapsed = Math.max(0, now - startTime)
      const next = Math.min(1, elapsed / total)
      setP(next)
      if (next < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scheduleTime, startTime])
  const style = small ? { width: 44, height: 6 } : { width: 60, height: 6 }
  return (
    <span aria-label="Queued" title="Queued" data-testid="queued-progress" className="relative inline-block overflow-hidden rounded bg-gray-200" style={style}>
      <span className="block h-full bg-gray-500 transition-[width] duration-75" style={{ width: `${p * 100}%` }} />
      <span className="absolute inset-0 shimmer" aria-hidden="true" />
    </span>
  )
}

// Thin, unobtrusive progress strip positioned at the top edge of the row
function QueuedStrip({ scheduleTime, startTime }: { scheduleTime: number; startTime: number }) {
  const fillRef = useRef<HTMLSpanElement | null>(null)
  useEffect(() => {
    const ctx = audioService.audioCtx
    const now = ctx ? ctx.currentTime : 0
    const total = Math.max(0.001, scheduleTime - startTime)
    const elapsed = Math.max(0, now - startTime)
    const p0 = Math.min(1, elapsed / total)
    const remaining = Math.max(0, scheduleTime - now)

    const el = fillRef.current
    if (!el) return

    // Initialize at current progress, then animate to full over remaining time.
    el.style.transformOrigin = 'left'
    el.style.transition = 'none'
    el.style.transform = `scaleX(${p0})`

    const id = requestAnimationFrame(() => {
      const el2 = fillRef.current
      if (!el2) return
      if (remaining <= 0) {
        el2.style.transform = 'scaleX(1)'
        el2.style.transition = 'none'
        return
      }
      el2.style.transition = `transform ${remaining}s linear`
      el2.style.transform = 'scaleX(1)'
    })
    return () => cancelAnimationFrame(id)
  }, [scheduleTime, startTime])
  return (
    <span
      aria-label="Queued"
      title="Queued"
      className="pointer-events-none absolute left-0 right-0 top-0 h-[2px] overflow-hidden rounded-full bg-gray-200"
    >
      <span ref={fillRef} className="absolute inset-y-0 left-0 w-full bg-gray-500 shadow-[0_0_8px_rgba(19,32,103,0.35)] will-change-transform" style={{ transform: 'scaleX(0)' }} />
      <span className="absolute inset-0 shimmer" aria-hidden="true" />
    </span>
  )
}
