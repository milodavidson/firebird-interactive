'use client'

import { useEffect, useMemo } from 'react'
import PlayerControls from './PlayerControls'
import PartsGrid from './PartsGrid'
import InstrumentList from './InstrumentList'
import { usePartsStore } from '@/hooks/usePartsStore'
import { AudioScheduler } from '@/lib/audio/AudioScheduler'
import { useAudioInspector } from '@/hooks/useAudioInspector'
import FirebirdProgressChip from './FirebirdProgressChip'
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
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-white border border-gray-300 rounded px-2 py-1">Skip to main content</a>
  <header className="mb-2 py-2 lg:py-0 grid items-center gap-1 md:gap-2 grid-cols-[1fr_auto] md:grid-cols-[auto,1fr,auto] xl:grid-cols-[auto,1fr,auto] sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 lg:static lg:bg-transparent lg:backdrop-blur-0 lg:border-0">
  {/* Row 1: Title only on mobile (hide description), centered on mobile */}
  <div className="justify-self-center md:justify-self-start col-start-1 col-end-2 row-start-1 min-w-0">
          <div className="min-w-0">
            <h1 className="m-0 text-sm sm:text-lg leading-tight font-semibold text-[var(--color-brand-navy)] truncate">Orchestra Sandbox</h1>
            <p className="hidden sm:block text-[11px] sm:text-sm leading-snug text-gray-600 overflow-hidden text-ellipsis">Build parts, mix, and play.</p>
          </div>
        </div>
        {/* Row 2: Chip centered on mobile; center column on md+ */}
        <div className="col-span-2 row-start-2 md:row-auto md:col-span-1 md:col-start-2 md:col-end-3 w-full flex justify-center md:block md:justify-self-stretch">
          <FirebirdProgressChip />
        </div>
        {/* Row 3: Controls centered on mobile; right column on md+ */}
        <div className="col-span-2 row-start-3 md:row-auto md:col-span-1 md:col-start-3 md:col-end-4 w-full md:w-auto justify-self-stretch md:justify-self-end mt-0 mb-0">
          <PlayerControls scheduler={scheduler} />
        </div>
      </header>
  <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px,1fr] flex-1 min-h-0" id="main" role="main">
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
