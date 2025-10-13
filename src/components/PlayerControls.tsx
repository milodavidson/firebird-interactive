'use client'

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

  const onTempoChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const t = e.target.value as 'fast' | 'slow'
      // Update UI selection immediately, but do not mutate currentTempoRef when playing.
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
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="tempo">Tempo</label>
        <select id="tempo" value={tempo} onChange={onTempoChange} aria-label="Tempo" className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm">
          <option value="fast">Fast</option>
          <option value="slow">Slow</option>
        </select>
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
