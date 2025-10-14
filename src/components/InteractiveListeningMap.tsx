'use client'

import { useEffect, useMemo, useRef } from 'react'
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

  const headerRef = useRef<HTMLElement | null>(null)
  const asideRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    function updateAsideTop() {
      const headerEl = headerRef.current
      const asideEl = asideRef.current
      if (!headerEl || !asideEl) return

      const mdPx = 768
      const headerHeight = headerEl.getBoundingClientRect().height

      if (window.innerWidth >= mdPx) {
        asideEl.style.top = `${headerHeight}px`
        asideEl.style.maxHeight = `calc(100vh - ${headerHeight}px)`
      } else {
        // remove inline values so Tailwind classes take over on mobile
        asideEl.style.top = ''
        asideEl.style.maxHeight = ''
      }
    }

    updateAsideTop()
    window.addEventListener('resize', updateAsideTop)
    // also observe header size changes (e.g., font changes)
    const ro = new ResizeObserver(updateAsideTop)
    if (headerRef.current) ro.observe(headerRef.current)

    return () => {
      window.removeEventListener('resize', updateAsideTop)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="mx-auto max-w-6xl p-4 min-h-svh flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-white border border-gray-300 rounded px-2 py-1">Skip to main content</a>
  <header ref={headerRef} className="mb-2 py-2 lg:py-0 grid items-center gap-1 md:gap-2 grid-cols-[1fr_auto] md:grid-cols-[auto,1fr,auto] xl:grid-cols-[auto,1fr,auto] sticky top-0 z-40 bg-white backdrop-blur-sm border-b-0 lg:border-b lg:border-gray-200 lg:static">
  {/* Row 1: Title only on mobile (hide description), centered on mobile */}
  <div className="justify-self-center md:justify-self-start col-start-1 col-end-2 row-start-1 min-w-0">
          <div className="min-w-0 flex items-center gap-2 md:block">
            <h1 className="m-0 text-sm md:text-lg leading-tight font-semibold text-[var(--color-brand-navy)] truncate">Orchestra Sandbox</h1>
            <p className="text-[11px] md:text-sm leading-snug text-gray-600 overflow-hidden text-ellipsis">Build parts, mix, and play.</p>
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
  <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px,1fr] md:items-stretch flex-1 min-h-0" id="main" role="main">
        {/* Mobile: make the instruments panel sticky to the header. On md+ keep normal flow */}
  <aside ref={asideRef} className="card p-4 h-full sticky top-20 z-30 md:sticky md:z-30 md:self-stretch self-start max-h-[calc(100vh-5rem)] overflow-auto">
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
