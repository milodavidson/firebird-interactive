"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { trapFocus } from '@/lib/a11y/focusTrap'
import * as Tooltip from '@radix-ui/react-tooltip'
import { HelpCircle } from 'lucide-react'
import { usePartsStore } from '@/hooks/usePartsStore'
import * as styles from './OnboardingTour.css'

type Step = 1 | 2 | 3 | 4

const STEP_COPY: Record<Step, string> = {
  1: 'Drag or tap an instrument to pick it up.',
  2: 'Start the music, change the tempo, or clear the grid.',
  3: 'Solo, mute, set dynamics, or remove instruments — new ones join on the next loop.',
  4: 'This bar fills as your choices match Stravinsky\'s actual Firebird finale — see how close you can get!'
}

// Persistent key for first-time-only behavior
const STORAGE_KEY = 'firebird_onboarding_seen_v1'

// Safe wrappers for localStorage access. Accessing localStorage can throw
// in some embedded contexts (cross-origin iframes, blocked storage, etc.).
// These wrappers catch errors and return null/ignore writes so the UI still
// functions even when storage is unavailable.
const safeGetItem = (key: string) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    return window.localStorage.getItem(key)
  } catch (e) {
    return null
  }
}

const safeSetItem = (key: string, value: string) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem(key, value)
  } catch (e) {
    // ignore failures
  }
}

const safeRemoveItem = (key: string) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.removeItem(key)
  } catch (e) {
    // ignore failures
  }
}

export default function OnboardingTour() {
  const { parts, selectedInstrument } = usePartsStore()
  // step is null until the user chooses to start the tour
  const [step, setStep] = useState<Step | null>(null)
  const [visible, setVisible] = useState(false)
  // Modal shown on first-open (before the tour starts). If modalVisible is true,
  // the tooltip-based tour remains hidden until the user clicks "Start".
  const [modalVisible, setModalVisible] = useState(false)
  // Avoid rendering during SSR/hydration — only show after mounted on client.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const deferStep3OnAddRef = useRef(false)
  const [deferStep3OnAdd, setDeferStep3OnAdd] = useState(false)
  const isolatedDontAdvanceRef = useRef(false)
  const [awaitingDrop, setAwaitingDrop] = useState(false)
  const prevAssignedCountRef = useRef<number>(parts.reduce((s, p) => s + p.assignedInstruments.length, 0))

  // First-time only behavior: check localStorage and install backdoors after mount
  useEffect(() => {
    if (!mounted) return
    // If already seen, don't show the modal or tour. Otherwise show the modal
    // on first open and keep the tour hidden until the user clicks Start.
  if (safeGetItem(STORAGE_KEY) === '1') {
      setVisible(false)
      setStep(null)
      setModalVisible(false)
    } else {
      setVisible(false)
      setStep(null)
      setModalVisible(true)
    }

    // Expose console backdoors for testing.
    const showOnboarding = () => {
      // Start the tooltip tour immediately (does not change seen flag)
      setModalVisible(false)
      setVisible(true)
      setStep(1)
    }

    const resetOnboarding = () => {
      // Clear the seen flag and reopen the intro modal so the user can choose again
  safeRemoveItem(STORAGE_KEY)
      setModalVisible(true)
      setVisible(false)
      setStep(null)
    }

    ;(window as any).__showOnboarding = showOnboarding
    ;(window as any).__resetOnboarding = resetOnboarding

    // Keyboard backdoor: Ctrl+Shift+O (attached at mount and removed on unmount)
    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyO') {
        e.preventDefault()
        resetOnboarding()
      }
    }
    window.addEventListener('keydown', keyHandler)
    return () => window.removeEventListener('keydown', keyHandler)
  }, [mounted])

  // Handler for Next button that must branch for step 2
  function handleNext() {
    // If we are in isolated mode (a one-off step3 shown after a deferred skip),
    // don't advance to step 4 — close the isolated flow instead.
    if (step === 3 && isolatedDontAdvanceRef.current) {
      isolatedDontAdvanceRef.current = false
      setIsolatedStep3Mode(false)
      setIsolatedInstId(null)
      setVisible(false)
      setStep(null)
      return
    }

    if (step === 2) {
      const anyAssigned = parts.some(p => p.assignedInstruments.length > 0)
      if (!anyAssigned) {
        // mark that we skipped step 3 and, when an instrument is later added,
        // show it as an isolated non-advancing step (don't auto-advance to 4)
        deferStep3OnAddRef.current = true
        setDeferStep3OnAdd(true)
        isolatedDontAdvanceRef.current = true
        // ensure the tour stays visible when we jump to step 4
        setVisible(true)
        setStep(4)
        return
      }
    }

    setStep(prev => (prev === 4 ? null : (((prev || 1) + 1) as Step)) )
  }

  // Isolated mini-step 3 shown after the initial tour skipped step3 (deferred)
  const [isolatedStep3Mode, setIsolatedStep3Mode] = useState(false)
  const [isolatedInstId, setIsolatedInstId] = useState<string | null>(null)

  // Trap focus when the modal is visible and restore focus when closed.
  useEffect(() => {
    if (!modalVisible) return
    const dialog = document.querySelector('[role="dialog"][aria-labelledby="onboarding-title"]') as HTMLElement | null
    if (!dialog) return
    // Hide main content from assistive tech while modal is open
    const rootMain = document.getElementById('main')
    const prevAria = rootMain?.getAttribute('aria-hidden') ?? null
    if (rootMain) rootMain.setAttribute('aria-hidden', 'true')
    const previous = document.activeElement as HTMLElement | null
    const release = trapFocus(dialog)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalVisible(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      release()
      document.removeEventListener('keydown', onKey)
      // restore aria-hidden on main
      if (rootMain) {
        if (prevAria == null) rootMain.removeAttribute('aria-hidden')
        else rootMain.setAttribute('aria-hidden', prevAria)
      }
      if (previous && typeof previous.focus === 'function') previous.focus()
    }
  }, [modalVisible])

  // Compute target element for each step
  const targetEl = useMemo(() => {
    if (!step) return null
    if (typeof document === 'undefined') return null
    switch (step) {
        case 1: {
          // If we are awaiting a drop (user clicked or picked up an instrument), target parts-grid
          const anyAssigned = parts.some(p => p.assignedInstruments.length > 0)
          if (awaitingDrop) return document.querySelector('[data-tour="parts-grid"]') as HTMLElement | null
          // If any assigned already exists prefer parts-grid to avoid jumping
          if (anyAssigned) return document.querySelector('[data-tour="parts-grid"]') as HTMLElement | null
          if (selectedInstrument) return document.querySelector('[data-tour="parts-grid"]') as HTMLElement | null
          return document.querySelector('[data-tour="instruments-list"]') as HTMLElement | null
        }
      case 2:
        return document.querySelector('[data-tour="player-controls"]') as HTMLElement | null
      case 3: {
        if (isolatedInstId) {
          return document.querySelector(`[data-inst-id="${isolatedInstId}"]`) as HTMLElement | null
        }
        for (const p of parts) {
          if (p.assignedInstruments.length > 0) {
            const inst = p.assignedInstruments[0]
            return document.querySelector(`[data-inst-id="${inst.id}"]`) as HTMLElement | null
          }
        }
        return null
      }
      case 4:
        return document.querySelector('[aria-label^="Firebird progress"]') as HTMLElement | null
      default:
        return null
    }
  }, [step, parts, selectedInstrument, awaitingDrop])

  // Advance conditions
  useEffect(() => {
    if (!step) return
    // onClickNext replaced by handleNext above (used by the Next button)

    // Step 1: attach click/dragstart on instrument list to indicate pickup, and progress when an instrument is added
    if (step === 1) {
      const list = document.querySelector('[data-tour="instruments-list"]')
      const onPickup = () => {
        setAwaitingDrop(true)
        // keep awaitingDrop true for up to 8s in case user hesitates
        setTimeout(() => {
          setAwaitingDrop(false)
        }, 8000)
      }
      list?.addEventListener('click', onPickup)
      list?.addEventListener('dragstart', onPickup)
      const onDocDragStart = (e: DragEvent) => {
        // Only treat dragstart as pickup if it started from inside the instruments list
        if (!list) return
        if (e.target && (list as HTMLElement).contains(e.target as Node)) onPickup()
      }
      document.addEventListener('dragstart', onDocDragStart, true)

      // If a part got an instrument, advance to step 2
      const anyAssigned = parts.some(p => p.assignedInstruments.length > 0)
      if (anyAssigned) {
        setAwaitingDrop(false)
        setStep(2)
      }

      return () => {
        list?.removeEventListener('click', onPickup)
        list?.removeEventListener('dragstart', onPickup)
        document.removeEventListener('dragstart', onDocDragStart, true)
      }
    }

    // Step 2: listen for clicks on play/tempo/clear
    if (step === 2) {
      // Use delegated click listener on document so we catch clicks even when
      // the Clear button is rendered inside a portal or wasn't present when
      // this effect ran. Match by aria-label on button.
      const onDocClick = (e: MouseEvent) => {
        const target = e.target as Element | null
        if (!target) return
        // Walk up to find a button with the aria-label
        const btn = target.closest('button[aria-label="Clear"]') as HTMLButtonElement | null
        if (!btn) return
        const anyAssigned = parts.some(p => p.assignedInstruments.length > 0)
        if (!anyAssigned) {
          deferStep3OnAddRef.current = true
          setDeferStep3OnAdd(true)
          isolatedDontAdvanceRef.current = true
          setVisible(true)
          setStep(4)
        } else {
          setStep(3)
        }
      }
      document.addEventListener('click', onDocClick)
      return () => document.removeEventListener('click', onDocClick)
    }

    // Step 3 progression is now driven only by the Next button (no DOM listeners)

    // Step 4: listen for click on chip
    if (step === 4) {
      const chip = targetEl
      const h = () => { setStep(null); setVisible(false) }
      chip?.addEventListener('click', h)
      return () => chip?.removeEventListener('click', h)
    }

    return () => {}
  }, [step, parts, targetEl])

  // If we deferred showing step 3 (because Clear was pressed during step 2 with no instruments),
  // show step 3 as a single tooltip when an instrument is added in the future.
  useEffect(() => {
    // Track assigned counts and, if we deferred step 3, show isolated step3 only when first instrument is added
    const currentCount = parts.reduce((s, p) => s + p.assignedInstruments.length, 0)
    const prevCount = prevAssignedCountRef.current
    // If we deferred step 3 (no instrument at time of skipping) and count goes 0 -> 1, trigger isolated step3
  if ((deferStep3OnAddRef.current || deferStep3OnAdd) && prevCount === 0 && currentCount === 1) {
      // find the newly added instrument id
      let newId: string | null = null
      for (const p of parts) {
        for (const ai of p.assignedInstruments) {
          newId = ai.id
          break
        }
        if (newId) break
      }
  deferStep3OnAddRef.current = false
  setDeferStep3OnAdd(false)
      setIsolatedInstId(newId)
      // Wait for the element to finish layout/animation before showing the isolated tooltip so highlight lands correctly.
      if (newId) {
        const selector = `[data-inst-id="${newId}"]`
        // poll until bounding rect is stable for 80ms or timeout 1500ms
        const stableFor = 80
        const timeout = 1500
        let lastRect: DOMRect | null = null
        let stableSince = 0
        const start = performance.now()
        const raf = () => {
          const el = document.querySelector(selector) as HTMLElement | null
          if (!el) {
            if (performance.now() - start < timeout) return requestAnimationFrame(raf)
            // fallback: show anyway
            setIsolatedStep3Mode(true)
            setVisible(true)
            setStep(3)
            return
          }
          const r = el.getBoundingClientRect()
          if (lastRect && Math.abs(r.left - lastRect.left) < 0.5 && Math.abs(r.top - lastRect.top) < 0.5 && Math.abs(r.width - lastRect.width) < 0.5 && Math.abs(r.height - lastRect.height) < 0.5) {
            if (!stableSince) stableSince = performance.now()
            if (performance.now() - stableSince >= stableFor) {
              // stable: show isolated step 3
              setIsolatedStep3Mode(true)
              setVisible(true)
              setStep(3)
              return
            }
          } else {
            stableSince = 0
          }
          lastRect = r
          if (performance.now() - start < timeout) requestAnimationFrame(raf)
          else {
            // timeout fallback
            setIsolatedStep3Mode(true)
            setVisible(true)
            setStep(3)
          }
        }
        requestAnimationFrame(raf)
      } else {
        // no id found: show immediately
        setIsolatedStep3Mode(true)
        setVisible(true)
        setStep(3)
      }
    }

    // If we're currently on the regular step 3 and the user removed the instrument(s),
    // treat that like clicking Next: advance to step 4 and clear any deferred isolated-step3 flags.
    if (step === 3 && !isolatedStep3Mode && prevCount > 0 && currentCount === 0) {
      deferStep3OnAddRef.current = false
      setDeferStep3OnAdd(false)
      isolatedDontAdvanceRef.current = false
      setStep(4)
      prevAssignedCountRef.current = currentCount
      return
    }

    // Update previous count
    prevAssignedCountRef.current = currentCount
  }, [parts])
  // Layout follow: when the target moves/resizes (window resize/scroll or element resize),
  // force a re-render so the rect/tooltip are recalculated. We throttle via requestAnimationFrame.
  const [layoutTick, setLayoutTick] = useState(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    if (!mounted) return
    if (!visible) return
    const el = targetEl
    if (!el) return

    const scheduleUpdate = () => {
      if (rafRef.current != null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        setLayoutTick(t => t + 1)
      })
    }

    // ResizeObserver for the element itself
    let ro: ResizeObserver | null = null
    try {
      ro = new ResizeObserver(scheduleUpdate)
      ro.observe(el)
    } catch (e) {
      ro = null
    }

    // Attach listeners to the element's scrollable ancestors (so the highlight
    // follows elements that scroll inside containers, not only page scroll).
    const getScrollParents = (node: Element | null) => {
      const parents: (Element | Window)[] = []
      let cur: Element | null = node
      while (cur) {
        try {
          const style = getComputedStyle(cur)
          const overflowY = style.overflowY
          const isScrollable = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay'
          if (isScrollable) parents.push(cur)
        } catch (e) {
          // ignore
        }
        cur = cur.parentElement
      }
      parents.push(window)
      return parents
    }

    const scrollParents = getScrollParents(el)
    const attached: Array<{target: Element | Window, handler: EventListener}> = []
    for (const p of scrollParents) {
      const handler = scheduleUpdate as EventListener
      try {
        ;(p as any).addEventListener('scroll', handler, { passive: true })
        attached.push({ target: p, handler })
      } catch (e) {
        // ignore attach failures
      }
    }

    // Window resize is still important
    window.addEventListener('resize', scheduleUpdate, { passive: true })

    // Also schedule one initial update to snap overlay into place
    scheduleUpdate()

    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener('resize', scheduleUpdate)
      for (const a of attached) {
        try { (a.target as any).removeEventListener('scroll', a.handler) } catch (e) {}
      }
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  // Intentionally depend on targetEl/visible so observers reattach when it changes.
  }, [mounted, visible, targetEl])

  // Prevent hydration mismatch: don't render anything until mounted on client
  if (!mounted) return null
  // Note: we intentionally do NOT early-return when the tour is hidden because
  // we render a small fixed "Replay tutorial" button that must always be
  // available once mounted. The overlay/tooltip themselves still only render
  // when `visible` and `step` are set.

  // Compute highlight rect (guard window/document for SSR)
  const rect = (typeof window !== 'undefined' && targetEl) ? targetEl.getBoundingClientRect() : null
  // Allow step-specific rect adjustments (e.g., widen controls highlight)
  const adjustedRect = rect ? (() => {
    if (rect) {
      if (step === 2 || step === 3 || step === 4) {
        const extra = 4
        return new DOMRect(rect.left - extra, rect.top, rect.width + extra * 2, rect.height)
      }
      // For step 1, clamp the bottom edge to the divider between instruments list and QuickMixes
      if (step === 1) {
        try {
          const divider = document.querySelector('[data-tour="instruments-divider"]') as HTMLElement | null
          const list = document.querySelector('[data-tour="instruments-list"]') as HTMLElement | null
          if (divider && list && list.contains(targetEl)) {
            const divRect = divider.getBoundingClientRect()
            // If divider is below the instruments rect, reduce height to stop at divider
            if (divRect.top > rect.top && divRect.top < rect.bottom) {
              return new DOMRect(rect.left, rect.top, rect.width, Math.max(0, divRect.top - rect.top))
            }
          }
        } catch (e) {
          // ignore DOM errors
        }
      }
    }
    return rect
  })() : null

  const style: React.CSSProperties = adjustedRect ? {
    position: 'fixed',
    // getBoundingClientRect() returns viewport-relative coordinates. For a
    // fixed-position overlay we should use those directly so the highlight
    // follows sticky elements and container scrolls correctly.
    left: adjustedRect.left,
    top: adjustedRect.top,
    width: adjustedRect.width,
    height: adjustedRect.height,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
    borderRadius: 8,
    pointerEvents: 'none',
    transition: 'all 200ms ease'
  } : { display: 'none' }

  // Compute tooltip placement so it stays inside the viewport
  const tooltipEl = adjustedRect ? (() => {
    const vpW = Math.max(320, typeof window !== 'undefined' ? window.innerWidth : 320)
    const vpH = typeof window !== 'undefined' ? window.innerHeight : 800
    const margin = 12
    const tooltipW = Math.min(360, vpW - margin * 2)
    const xl = (typeof window !== 'undefined' ? window.innerWidth : 0) >= 1280
    // On xl, prefer side placement (right of instruments list / left of parts-grid)
    if (xl) {
      // If highlighting instruments list, place to its right; if highlighting parts-grid, place to its left
      const isInstrumentsList = !!document.querySelector('[data-tour="instruments-list"]') && document.querySelector('[data-tour="instruments-list"]')!.contains(targetEl)
      if (isInstrumentsList && adjustedRect) {
        const left = adjustedRect.left + adjustedRect.width + 12
        const top = adjustedRect.top
        return { top, left, width: tooltipW }
      }
      const isPartsGrid = !!document.querySelector('[data-tour="parts-grid"]') && document.querySelector('[data-tour="parts-grid"]')!.contains(targetEl)
      if (isPartsGrid && adjustedRect) {
        const left = adjustedRect.left - 12 - tooltipW
        const top = adjustedRect.top
        return { top, left, width: tooltipW }
      }
    }
    const preferBelow = adjustedRect.top + adjustedRect.height + 12 + 80 < vpH // if there's room below for ~80px tooltip
    const top = preferBelow ? adjustedRect.top + adjustedRect.height + 12 : adjustedRect.top - 12 - 80
    const leftRaw = adjustedRect.left + 12
    const left = Math.min(Math.max(margin, leftRaw), vpW - tooltipW - margin)
    return { top, left, width: tooltipW }
  })() : null

  return (
    <div aria-hidden="false">
      {/* Replay icon with Radix tooltip (short delay) */}
      <Tooltip.Provider delayDuration={100}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
                aria-label="Help"
                onClick={() => {
                  // Open the modal so users can choose to start or skip the tour.
                  setModalVisible(true)
                  setVisible(false)
                  setStep(null)
                }}
              style={{
                position: 'fixed',
                right: 12,
                bottom: 12,
                zIndex: 70,
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(0,0,0,0.06)',
                width: 34,
                height: 34,
                padding: 0,
                borderRadius: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                opacity: 0.95,
                cursor: 'pointer'
              }}
            >
              <HelpCircle size={16} aria-hidden />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content sideOffset={6} align="center" style={{ background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '6px 8px', borderRadius: 6, fontSize: 12, zIndex: 80 }}>
            Help
            <Tooltip.Arrow offset={6} style={{ fill: 'rgba(0,0,0,0.85)' }} />
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>

      {/* Overlay highlight: only show when the tooltip-based tour is visible */}
      {visible && !modalVisible && adjustedRect && (
        <div style={style} data-tour-highlight className={styles.highlight} />
      )}
      {/* First-open modal (placeholder copy). Only shown when modalVisible is true. */}
      {modalVisible && (
        // Use a very high z-index to ensure the modal covers any tour highlights.
        <div className={styles.modalOverlay} aria-hidden={modalVisible ? 'false' : 'true'}>
          <div className={styles.modalBackdrop} onClick={() => setModalVisible(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className={styles.modalDialog}>
            {/* While the modal is open, hide any existing tour overlays/tooltips to avoid visual artifacts */}
            <style>{`[data-tour-highlight],[data-tour-tooltip]{display:none !important}`}</style>
            <h3 id="onboarding-title" className={styles.modalTitle}>Welcome to the Orchestra Sandbox!</h3>
            <p className={styles.modalText}>Experiment with instruments, tempo, and dynamics to craft your own orchestral version of Stravinsky's finale to <em>The Firebird</em> — or just see what sounds you can create.</p>
            <div className={styles.modalActions}>
              <button
                className={styles.button({ variant: 'outline' })}
                onClick={() => {
                  // Persist skip so modal/tour won't show again
                  if (typeof window !== 'undefined') safeSetItem(STORAGE_KEY, '1')
                  setModalVisible(false)
                  setVisible(false)
                  setStep(null)
                }}
              >
                Skip
              </button>
              <button
                className={styles.button({ variant: 'primary' })}
                onClick={() => {
                  setModalVisible(false)
                  setVisible(true)
                  setStep(1)
                }}
              >
                Start tour
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating tooltip */}
      {visible && !modalVisible && adjustedRect && tooltipEl && (
        <div data-tour-tooltip ref={tooltipRef} className={styles.tooltipContainer} style={{ left: tooltipEl.left, top: tooltipEl.top, width: tooltipEl.width }}>
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipText}>
              {step === 1 && awaitingDrop ? 'Drop or tap to assign it to a part.' : (
                step === 4 ? (
                  // Render Firebird in italics without using raw HTML
                  <>This bar fills as your choices match Stravinsky's actual <em>Firebird</em> finale. Click to watch it performed, and see how close you can get!</>
                ) : (
                  STEP_COPY[step as Step]
                )
              )}
            </div>
            <div className={styles.tooltipActions}>
              <button
                className={styles.button({ variant: isolatedStep3Mode ? 'primary' : 'outline' })}
                onClick={() => {
                  // Persist seen flag and Close behavior differs if this is isolated mode
                  if (typeof window !== 'undefined') safeSetItem(STORAGE_KEY, '1')
                  if (isolatedStep3Mode) {
                    setIsolatedStep3Mode(false)
                    setIsolatedInstId(null)
                    setVisible(false)
                    setStep(null)
                    return
                  }
                  setStep(null); setVisible(false)
                }}
              >{isolatedStep3Mode ? 'Done' : 'Close'}</button>
              {!isolatedStep3Mode && (
                <button className={styles.button({ variant: 'primary' })} onClick={() => {
                  // On Finish persist the seen flag
                  if (step === 4 && typeof window !== 'undefined') safeSetItem(STORAGE_KEY, '1')
                  handleNext()
                }}>{step === 4 ? 'Finish' : 'Next'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
