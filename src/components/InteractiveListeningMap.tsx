'use client'

import { useEffect, useMemo } from 'react'
import PlayerControls from './PlayerControls'
import PartsGrid from './PartsGrid'
import InstrumentList from './InstrumentList'
import { usePartsStore } from '@/hooks/usePartsStore'
import { AudioScheduler } from '@/lib/audio/AudioScheduler'
import { useAudioInspector } from '@/hooks/useAudioInspector'
import BeatDebug from './BeatDebug'

export default function InteractiveListeningMap() {
  const store = usePartsStore()
  const scheduler = useMemo(
    () =>
      new AudioScheduler({
        partsRef: store.partsRef,
        playStateRef: store.playStateRef,
        transportStartRef: store.transportStartRef,
        currentTempoRef: store.currentTempoRef,
        deferredQueueRef: store.deferredQueueRef,
        removedInstanceIdsRef: store.removedInstanceIdsRef,
        nodeStartTimesRef: store.nodeStartTimesRef,
        setParts: store.setParts
      }),
    []
  )
  useAudioInspector(scheduler)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, padding: 16 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20 }}>Interactive Listening Map</h1>
        <p style={{ color: '#555' }}>Assign instruments to parts and play.</p>
  <PlayerControls scheduler={scheduler} />
        <InstrumentList />
      </div>
      <div>
        <PartsGrid />
        <BeatDebug scheduler={scheduler} />
      </div>
    </div>
  )
}
