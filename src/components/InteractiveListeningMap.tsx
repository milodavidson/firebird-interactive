'use client'

import { useEffect, useMemo } from 'react'
import PlayerControls from './PlayerControls'
import PartsGrid from './PartsGrid'
import InstrumentList from './InstrumentList'
import { usePartsStore } from '@/hooks/usePartsStore'
import { AudioScheduler } from '@/lib/audio/AudioScheduler'
import { useAudioInspector } from '@/hooks/useAudioInspector'
// import BeatDebug from './BeatDebug'

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
    <div className="mx-auto max-w-6xl p-4 min-h-svh flex flex-col">
      <header className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="m-0 text-xl font-semibold text-[var(--color-brand-navy)]">Orchestra Sandbox</h1>
          <p className="text-sm text-gray-600">Build parts, mix, and play.</p>
        </div>
        <PlayerControls scheduler={scheduler} />
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px,1fr] flex-1 min-h-0">
        <aside className="card p-4 h-full">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Instruments</h2>
          <InstrumentList />
        </aside>
        <main className="card p-4 h-full overflow-auto min-h-0">
          <div className="h-full min-h-0">
            <PartsGrid />
          </div>
          {/* <div className="mt-4">
            <BeatDebug scheduler={scheduler} />
          </div> */}
        </main>
      </div>
    </div>
  )
}
