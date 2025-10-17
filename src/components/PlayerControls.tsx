"use client"

import { useCallback, useEffect, useRef } from 'react'
import { usePartsStore } from '@/hooks/usePartsStore'
import { audioService } from '@/lib/audio/AudioService'
import { AudioScheduler } from '@/lib/audio/AudioScheduler'
import { useSpaceToggle } from '@/hooks/useSpaceToggle'
import LoopProgress from './LoopProgress'
import { Eraser } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { announcePolite } from '@/lib/a11y/announce'

type Props = { scheduler?: AudioScheduler }

export default function PlayerControls({ scheduler }: Props = {}) {
  const { play, tempo, setPlay, setTempo, transportStartRef, currentTempoRef, setParts, deferredQueueRef, parts } = usePartsStore()

  // Total assigned instruments across all parts
  const totalAssigned = parts.reduce((sum, p) => sum + p.assignedInstruments.length, 0)
  const hasAnyInstruments = totalAssigned > 0

  const onToggle = useCallback(async () => {
    // Do nothing if there are no instruments
    if (!hasAnyInstruments) return
    audioService.initIfNeeded()
    if (!audioService.audioCtx) return
    if (audioService.audioCtx.state === 'suspended') await audioService.audioCtx.resume()
    if (!play) {
      setPlay(true)
      transportStartRef.current = audioService.audioCtx.currentTime
      if (scheduler) scheduler.scheduleLoopStartIfNeeded()
      announcePolite('Playback started')
    } else {
      setPlay(false)
      // Reset loop transport so progress ring returns to 0 on pause
      transportStartRef.current = null
      audioService.stopAllActive(50)
      scheduler?.stop()
      // Cancel any queued instruments so resume doesn't show queue strips
      deferredQueueRef.current = []
      setParts(prev => prev.map(p => ({
        ...p,
        assignedInstruments: p.assignedInstruments.map(ai => (
          ai.isLoading ? { ...ai, isLoading: false, queueStartTime: undefined, queueScheduleTime: undefined, queueTimeRemaining: undefined } : ai
        ))
      })))
      announcePolite('Playback paused')
    }
  }, [hasAnyInstruments, play, scheduler, setPlay, transportStartRef])

  useSpaceToggle(onToggle)

  const onClear = useCallback(() => {
    // reset state and stop audio
    setPlay(false)
    audioService.stopAllActive(50)
    transportStartRef.current = null
    currentTempoRef.current = 'slow'
    setTempo('slow')
    deferredQueueRef.current = []
    setParts(() => [
      { id: 'melody', name: 'Melody', assignedInstruments: [] },
      { id: 'harmony', name: 'Harmony', assignedInstruments: [] },
      { id: 'rhythm', name: 'Rhythm', assignedInstruments: [] },
      { id: 'texture', name: 'Texture', assignedInstruments: [] }
    ])
  }, [setPlay, transportStartRef, currentTempoRef, deferredQueueRef, setParts])

  const setTempoValue = useCallback(
    async (t: 'fast' | 'slow') => {
      setTempo(t)
      if (play && scheduler) {
        await scheduler.scheduleTempoSwitch(t)
        announcePolite(`Tempo set to ${t}`)
      }
    },
    [play, scheduler, setTempo]
  )

  // If the last instrument is removed during playback, stop and reset progress to 0
  useEffect(() => {
    if (play && !hasAnyInstruments) {
      setPlay(false)
      audioService.stopAllActive(50)
      transportStartRef.current = null
      scheduler?.stop()
    }
  }, [hasAnyInstruments, play, scheduler, setPlay, transportStartRef])

  return (
    <div data-tour="player-controls" className="grid grid-cols-[auto,1fr,auto] items-center w-full md:w-auto gap-2 sm:gap-3 md:gap-4 py-2">
      <div className="justify-self-center md:justify-self-start translate-y-[4px]">
        <LoopProgress size={56} onToggle={onToggle} disabled={!hasAnyInstruments} />
      </div>
      <div className="flex items-center justify-center">
        <div
          role="group"
          aria-label="Tempo"
          className="relative grid grid-cols-2 h-10 rounded-full border border-gray-300 bg-gray-100 overflow-hidden w-full min-w-0 max-w-[220px] sm:max-w-[240px]"
        >
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-0 w-1/2 rounded-full will-change-transform"
            style={{
              transform: tempo === 'fast' ? 'translateX(0%)' : 'translateX(100%)',
              backgroundColor: tempo === 'fast' ? 'var(--color-brand-red)' : 'var(--color-brand-navy)',
              transition: 'transform 250ms linear, background-color 250ms linear'
            }}
          />
          <button
            type="button"
            data-testid="tempo-fast"
            aria-pressed={tempo === 'fast'}
            className={`relative z-10 h-full px-3 text-[13px] sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 flex items-center justify-center ${tempo === 'fast' ? 'text-white' : 'text-gray-800'}`}
            onClick={() => setTempoValue(tempo === 'fast' ? 'slow' : 'fast')}
          >
            Fast
          </button>
          <button
            type="button"
            data-testid="tempo-slow"
            aria-pressed={tempo === 'slow'}
            className={`relative z-10 h-full px-3 text-[13px] sm:text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 flex items-center justify-center ${tempo === 'slow' ? 'text-white' : 'text-gray-800'}`}
            onClick={() => setTempoValue(tempo === 'slow' ? 'fast' : 'slow')}
          >
            Slow
          </button>
        </div>
      </div>
      <div className="justify-self-center md:justify-self-end">
        <Tooltip.Provider>
          <Tooltip.Root delayDuration={250}>
            <Tooltip.Trigger asChild>
              <button className="btn btn-outline pressable h-10 w-10 p-0" aria-label="Clear" onClick={onClear}><Eraser size={16} /></button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="bottom" sideOffset={6} className="z-50 rounded bg-black/90 px-2 py-1 text-xs text-white shadow">
                Clear
                <Tooltip.Arrow className="fill-black/90" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
    </div>
  )
}

// Attach Space key to toggle play/pause, ignoring typing in inputs
export function useSpaceToToggle(onToggle: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      // If a modal dialog is open, do not run the global space handler so
      // modal-local handlers can take precedence.
      const modal = document.querySelector('[role="dialog"][aria-modal="true"]')
      if (modal) return

      const target = e.target as HTMLElement | null
      const tag = (target?.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) return
      e.preventDefault()
      onToggle()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onToggle])
}
