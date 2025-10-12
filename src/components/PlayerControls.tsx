'use client'

import { useCallback, useEffect } from 'react'
import { usePartsStore } from '@/hooks/usePartsStore'
import { audioService } from '@/lib/audio/AudioService'
import { AudioScheduler } from '@/lib/audio/AudioScheduler'
import { useSpaceToggle } from '@/hooks/useSpaceToggle'

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
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' }}>
      <button onClick={onToggle} aria-label={play ? 'Pause' : 'Play'}>{play ? 'Pause' : 'Play'}</button>
      <label>
        Tempo:
        <select value={tempo} onChange={onTempoChange} aria-label="Tempo">
          <option value="fast">Fast</option>
          <option value="slow">Slow</option>
        </select>
      </label>
      <button onClick={onClear}>Clear</button>
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
