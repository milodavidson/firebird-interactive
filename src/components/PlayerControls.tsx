"use client"

import { useCallback, useEffect } from 'react'
import { usePartsStore } from '@/hooks/usePartsStore'
import { audioService } from '@/lib/audio/AudioService'
import { AudioScheduler } from '@/lib/audio/AudioScheduler'
import { useSpaceToggle } from '@/hooks/useSpaceToggle'
import LoopProgress from './LoopProgress'
import { Eraser } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'

type Props = { scheduler?: AudioScheduler }

export default function PlayerControls({ scheduler }: Props = {}) {
  const { play, tempo, setPlay, setTempo, transportStartRef, currentTempoRef, setParts, deferredQueueRef } = usePartsStore()

  const onToggle = useCallback(async () => {
    audioService.initIfNeeded()
    if (!audioService.audioCtx) return
    if (audioService.audioCtx.state === 'suspended') await audioService.audioCtx.resume()
    if (!play) {
      setPlay(true)
      transportStartRef.current = audioService.audioCtx.currentTime
      if (scheduler) scheduler.scheduleLoopStartIfNeeded()
    } else {
      setPlay(false)
      // Reset loop transport so progress ring returns to 0 on pause
      transportStartRef.current = null
      audioService.stopAllActive(50)
      scheduler?.stop()
    }
  }, [play, scheduler, setPlay, transportStartRef])

  useSpaceToggle(onToggle)

  const onClear = useCallback(() => {
    // reset state and stop audio
    setPlay(false)
    audioService.stopAllActive(50)
    transportStartRef.current = null
    currentTempoRef.current = 'fast'
    setTempo('fast')
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
      }
    },
    [play, scheduler, setTempo]
  )

  return (
    <div className="flex items-center gap-4 py-3">
      <LoopProgress size={84} onToggle={onToggle} />
      <div className="relative flex flex-col items-center gap-1 self-center -translate-y-2.5">
        <span id="tempo-label" className="text-sm font-medium text-gray-700 text-center">Tempo</span>
        <div
          role="group"
          aria-labelledby="tempo-label"
          className="relative grid grid-cols-2 rounded-full border border-gray-300 bg-gray-100 overflow-hidden"
          style={{ minWidth: 160 }}
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
            className={`relative z-10 px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${tempo === 'fast' ? 'text-white' : 'text-gray-800'}`}
            onClick={() => setTempoValue(tempo === 'fast' ? 'slow' : 'fast')}
          >
            Fast
          </button>
          <button
            type="button"
            data-testid="tempo-slow"
            aria-pressed={tempo === 'slow'}
            className={`relative z-10 px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${tempo === 'slow' ? 'text-white' : 'text-gray-800'}`}
            onClick={() => setTempoValue(tempo === 'slow' ? 'fast' : 'slow')}
          >
            Slow
          </button>
        </div>
      </div>
      <Tooltip.Provider>
        <Tooltip.Root delayDuration={250}>
          <Tooltip.Trigger asChild>
            <button className="btn btn-outline pressable" aria-label="Clear" onClick={onClear}><Eraser size={16} /></button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content sideOffset={6} className="rounded bg-black/90 px-2 py-1 text-xs text-white shadow">
              Clear
              <Tooltip.Arrow className="fill-black/90" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  )
}

// Attach Space key to toggle play/pause, ignoring typing in inputs
export function useSpaceToToggle(onToggle: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
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
