"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePartsStore } from '@/hooks/usePartsStore'

type Step = 1 | 2 | 3 | 4

const STEP_COPY: Record<Step, string> = {
  1: 'Drag or click an instrument to pick it up.',
  2: 'Start the music, change the tempo, or clear the grid.',
  3: 'Solo, mute, or remove instruments here. Instruments added while playing join in on the next loop.',
  4: 'This bar fills as your choices match Stravinsky\'s Firebird finale — see how close you can get!'
}

export default function OnboardingTour() {
  const { parts, selectedInstrument } = usePartsStore()
  const [step, setStep] = useState<Step | null>(1)
  const [visible, setVisible] = useState(true)
  // Avoid rendering during SSR/hydration — only show after mounted on client.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const deferStep3OnAddRef = useRef(false)
  const isolatedDontAdvanceRef = useRef(false)
  const [awaitingDrop, setAwaitingDrop] = useState(false)
  const prevAssignedCountRef = useRef<number>(parts.reduce((s, p) => s + p.assignedInstruments.length, 0))

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
    // If we're currently on the regular step 3 and the user removed the instrument(s),
    // treat that like clicking Next: advance to step 4 and clear any deferred isolated-step3 flags.
    if (step === 3 && !isolatedStep3Mode && prevCount > 0 && currentCount === 0) {
      deferStep3OnAddRef.current = false
      isolatedDontAdvanceRef.current = false
      setStep(4)
      prevAssignedCountRef.current = currentCount
      return
    }
    // If we deferred step 3 (no instrument at time of skipping) and count goes 0 -> 1, trigger isolated step3
    if (deferStep3OnAddRef.current && prevCount === 0 && currentCount === 1) {
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

    // Global listeners as fallback for scroll/resize
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    window.addEventListener('scroll', scheduleUpdate, { passive: true })

    // Also schedule one initial update to snap overlay into place
    scheduleUpdate()

    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('scroll', scheduleUpdate)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  // Intentionally depend on targetEl/visible so observers reattach when it changes.
  }, [mounted, visible, targetEl])

  // Prevent hydration mismatch: don't render anything until mounted on client
  if (!mounted) return null
  // First-time only behavior: check localStorage to see if this tour has been seen.
  // We only perform the localStorage check on the client (after mounted).
  // Also provide an invisible backdoor to re-run the tour for testing:
  //  - press Ctrl+Shift+O to clear the seen flag and show the tour
  //  - call window.__showOnboarding() from the console to show it
  if (typeof window !== 'undefined') {
    const STORAGE_KEY = 'firebird_onboarding_seen_v1'
    // Install a one-time effect-like check: if the tour was already seen, hide it
    // unless explicitly re-triggered by the backdoor (keyboard or window function).
    if (localStorage.getItem(STORAGE_KEY) === '1' && visible) {
      setVisible(false)
      setStep(null)
    }

    // Expose a console backdoor to re-run the tour for testing.
    ;(window as any).__showOnboarding = () => {
      localStorage.removeItem(STORAGE_KEY)
      setVisible(true)
      setStep(1)
    }

    // Keyboard backdoor: Ctrl+Shift+O
    const keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyO') {
        e.preventDefault()
        localStorage.removeItem(STORAGE_KEY)
        setVisible(true)
        setStep(1)
      }
    }
    window.addEventListener('keydown', keyHandler)
    // Remove listener after a short timeout to avoid lingering in-app listeners
    // but keep the window.__showOnboarding function available.
    setTimeout(() => window.removeEventListener('keydown', keyHandler), 10000)
  }

  if (!visible || !step) return null

  // Compute highlight rect (guard window/document for SSR)
  const rect = (typeof window !== 'undefined' && targetEl) ? targetEl.getBoundingClientRect() : null
  // Allow step-specific rect adjustments (e.g., widen controls highlight)
  const adjustedRect = rect ? (() => {
    if (rect) {
      if (step === 2 || step === 3 || step === 4) {
        const extra = 4
        return new DOMRect(rect.left - extra, rect.top, rect.width + extra * 2, rect.height)
      }
    }
    return rect
  })() : null

  const style: React.CSSProperties = adjustedRect ? {
    position: 'fixed',
    left: adjustedRect.left + (typeof window !== 'undefined' ? window.scrollX : 0),
    top: adjustedRect.top + (typeof window !== 'undefined' ? window.scrollY : 0),
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
        const left = adjustedRect.left + (typeof window !== 'undefined' ? window.scrollX : 0) + adjustedRect.width + 12
        const top = adjustedRect.top + (typeof window !== 'undefined' ? window.scrollY : 0)
        return { top, left, width: tooltipW }
      }
      const isPartsGrid = !!document.querySelector('[data-tour="parts-grid"]') && document.querySelector('[data-tour="parts-grid"]')!.contains(targetEl)
      if (isPartsGrid && adjustedRect) {
        const left = adjustedRect.left + (typeof window !== 'undefined' ? window.scrollX : 0) - 12 - tooltipW
        const top = adjustedRect.top + (typeof window !== 'undefined' ? window.scrollY : 0)
        return { top, left, width: tooltipW }
      }
    }
    const preferBelow = adjustedRect.top + adjustedRect.height + 12 + 80 < vpH // if there's room below for ~80px tooltip
    const top = preferBelow ? adjustedRect.top + (typeof window !== 'undefined' ? window.scrollY : 0) + adjustedRect.height + 12 : adjustedRect.top + (typeof window !== 'undefined' ? window.scrollY : 0) - 12 - 80
    const leftRaw = adjustedRect.left + (typeof window !== 'undefined' ? window.scrollX : 0) + 12
    const left = Math.min(Math.max(margin, leftRaw), vpW - tooltipW - margin)
    return { top, left, width: tooltipW }
  })() : null

  return (
    <div aria-hidden="false">
      {/* Overlay highlight */}
      <div style={style} data-tour-highlight className="z-50" />
      {/* Floating tooltip */}
      {adjustedRect && tooltipEl && (
        <div ref={tooltipRef} style={{ position: 'fixed', left: tooltipEl.left, top: tooltipEl.top, zIndex: 60, width: tooltipEl.width }}>
          <div className="max-w-full p-3 bg-white rounded shadow-lg text-sm">
            <div className="font-semibold mb-1">
              {step === 1 && awaitingDrop ? 'Now drop or click to assign it to a part.' : (
                step === 4 ? (
                  // Render Firebird in italics without using raw HTML
                  <>This bar fills as your choices match Stravinsky's <em>Firebird</em> finale — see how close you can get!</>
                ) : (
                  STEP_COPY[step]
                )
              )}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                className={isolatedStep3Mode ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                onClick={() => {
                  // Persist seen flag and Close behavior differs if this is isolated mode
                  if (typeof window !== 'undefined') localStorage.setItem('firebird_onboarding_seen_v1', '1')
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
                <button className="btn btn-primary btn-sm" onClick={() => {
                  // On Finish persist the seen flag
                  if (step === 4 && typeof window !== 'undefined') localStorage.setItem('firebird_onboarding_seen_v1', '1')
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
