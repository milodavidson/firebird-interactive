'use client'

import { useEffect, useMemo, useRef } from 'react'
import PlayerControls from './PlayerControls'
import PartsGrid from './PartsGrid'
import InstrumentList from './InstrumentList'
import OnboardingTour from './OnboardingTour'
import { usePartsStore } from '@/hooks/usePartsStore'
import { AudioScheduler } from '@/lib/audio/AudioScheduler'
import { useAudioInspector } from '@/hooks/useAudioInspector'
import FirebirdProgressChip from './FirebirdProgressChip'
import * as styles from './InteractiveListeningMap.css'
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

  // (removed defensive blur-on-mount; focus restoration should be handled safely by modals)

  return (
  <div className={styles.container}>
      <a href="#main" className={styles.skipLink}>Skip to main content</a>
  <header ref={headerRef} className={styles.header}>
  {/* Row 1: Title only on mobile (hide description), centered on mobile */}
  <div className={styles.titleSection}>
          <div className={styles.titleInner}>
            <h1 className={styles.title}>Orchestra Sandbox</h1>
            <p className={styles.subtitle}>Build parts, mix, and play.</p>
          </div>
        </div>
        {/* Row 2: Chip centered on mobile; center column on md+ */}
        <div className={styles.chipSection}>
          <FirebirdProgressChip />
        </div>
        {/* Row 3: Controls centered on mobile; right column on md+ */}
        <div className={styles.controlsSection}>
          <PlayerControls scheduler={scheduler} />
        </div>
      </header>
  <div className={styles.contentGrid}>
        {/* Mobile: make the instruments panel sticky to the header. On md+ keep normal flow */}
  <aside ref={asideRef} data-tour="instruments-list" className={styles.aside}>
          <h2 className={styles.asideTitle}>Instruments</h2>
          <InstrumentList />
        </aside>
  <main id="main" role="main" data-tour="parts-grid" className={styles.main}>
          <div className={styles.mainInner}>
            <PartsGrid />
          </div>
          {/* <div className="mt-4">
            <BeatDebug scheduler={scheduler} />
          </div> */}
        </main>
      </div>
      <OnboardingTour />
    </div>
  )
}
