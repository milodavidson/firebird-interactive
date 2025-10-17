"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import FirebirdVideoModal from './FirebirdVideoModal'
import { motion } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Check, X, Minus } from 'lucide-react'
import { usePartsStore } from '@/hooks/usePartsStore'
import { INSTRUMENTS } from '@/lib/instruments'

type PartId = 'melody' | 'harmony' | 'rhythm' | 'texture'

const FIREBIRD_REQ: Record<PartId, string[]> = {
  melody: ['brass'],
  harmony: ['brass'],
  rhythm: ['brass', 'woodwind', 'strings', 'percussion'],
  texture: ['brass', 'woodwind', 'strings']
}

export default function FirebirdProgressChip() {
  const { parts, tempo, play } = usePartsStore()
  const [showChecklist, setShowChecklist] = useState(false)
  // We'll repurpose showChecklist to open a modal dialog with the YouTube clip
  const containerRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLSpanElement | null>(null)
  const [anchorLeft, setAnchorLeft] = useState<number | null>(null)
  const [showShimmer, setShowShimmer] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  // remove mounted guard from this component; handled by modal
  const [reducedMotion, setReducedMotion] = useState(false)
  const [computedMaxWidth, setComputedMaxWidth] = useState<number | null>(null)

  // Respect user preference for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const set = () => setReducedMotion(!!mq.matches)
    set()
    try {
      mq.addEventListener('change', set)
    } catch (e) {
      // Safari fallback
      // @ts-ignore
      mq.addListener && mq.addListener(set)
    }
    return () => {
      try { mq.removeEventListener('change', set) } catch (e) { /* fallback */ }
      // @ts-ignore
      mq.removeListener && mq.removeListener(set)
    }
  }, [])


  const data = useMemo(() => {
    // Revised scoring: 1 point for each required instrument present (9),
    // +1 point for each required instrument at 100 loud (9), +1 for tempo fast (1) => total 19
    const partIds: PartId[] = ['melody','harmony','rhythm','texture']
    const requiredTotal = FIREBIRD_REQ.melody.length + FIREBIRD_REQ.harmony.length + FIREBIRD_REQ.rhythm.length + FIREBIRD_REQ.texture.length // 9
    let presentCount = 0
    let loudCount = 0

    // Details for checklist
    const presenceDetails: { part: PartId; inst: string; status: 'missing' | 'present-not-loud' | 'loud' }[] = []
    const extrasByPart: Record<PartId, string[]> = { melody: [], harmony: [], rhythm: [], texture: [] }
    for (const pid of partIds) {
      const required = FIREBIRD_REQ[pid]
      const part = parts.find(p => p.id === pid)
      for (const inst of required) {
        const matches = part?.assignedInstruments.filter(ai => ai.instrumentId === inst) || []
        if (matches.length === 0) {
          presenceDetails.push({ part: pid, inst, status: 'missing' })
          continue
        }
        presentCount += 1
        const anyLoud = matches.some(ai => ai.volumeBalance === 100)
        if (anyLoud) {
          loudCount += 1
          presenceDetails.push({ part: pid, inst, status: 'loud' })
        } else {
          presenceDetails.push({ part: pid, inst, status: 'present-not-loud' })
        }
      }
      // collect extras: instruments assigned to this part that are not in the required list
      const assigned = part?.assignedInstruments || []
      const extras = assigned
        .map(ai => ai.instrumentId)
        .filter(id => !required.includes(id))
      // de-duplicate extras per part
      extrasByPart[pid] = Array.from(new Set(extras))
    }
    const tempoOk = tempo === 'fast'
    const points = presentCount + loudCount + (tempoOk ? 1 : 0)
    const totalPoints = requiredTotal * 2 + 1 // 19
    const percent = Math.round((points / totalPoints) * 100)
    return { percent, points, totalPoints, presentCount, loudCount, requiredTotal, tempoOk, presenceDetails, extrasByPart }
  }, [parts, tempo])
  
  const nameById = useMemo(() => Object.fromEntries(INSTRUMENTS.map(i => [i.id, i.name])), []) as Record<string, string>

  // Trigger shimmer on reaching 100%
  const prevPercent = useRef<number>(0)
  useEffect(() => {
    if (prevPercent.current < 100 && data.percent === 100) {
      // Trigger a single-pass shimmer overlay
      if (!reducedMotion) setShowShimmer(true)
      const t2 = setTimeout(() => setShowShimmer(false), 900) // match shimmer duration (~0.8s) with small buffer
      return () => { clearTimeout(t2) }
    }
    prevPercent.current = data.percent
  }, [data.percent])

  // nothing for mounted here; modal handles its own portal mount

  // Close modal on ESC
  useEffect(() => {
    if (!showChecklist) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowChecklist(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey) }
  }, [showChecklist])

  // Anchor not needed for centered modal, but keep anchorLeft state for legacy positioning if required later

  // Progress bar color shifts
  const color = data.percent >= 100 ? 'bg-[var(--color-brand-red)]' : 'bg-[var(--color-brand-navy)]'

  // Compute a smooth max-width based on viewport width so we avoid hard jumps
  // at Tailwind's lg/xl breakpoints. We interpolate between the previous
  // sizes: 540 @768, 680 @1024, 820 @1280.
  useEffect(() => {
    if (typeof window === 'undefined') return
    let raf = 0
    const compute = () => {
      const w = window.innerWidth
      let maxW: number | null = null
      if (w < 768) {
        maxW = null
      } else if (w >= 1280) {
        maxW = 820
      } else if (w >= 1024) {
        const t = (w - 1024) / (1280 - 1024)
        maxW = 680 + t * (820 - 680)
      } else {
        // 768 <= w < 1024
        const t = (w - 768) / (1024 - 768)
        maxW = 540 + t * (680 - 540)
      }
      setComputedMaxWidth(maxW ? Math.round(maxW) : null)
    }
    const handler = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('resize', handler)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
  <div ref={containerRef} className="relative inline-flex items-center w-full">
      <Tooltip.Provider>
  <Tooltip.Root delayDuration={0}>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              aria-label={`Firebird progress ${data.points} of ${data.totalPoints}`}
              aria-expanded={showChecklist}
              aria-controls="firebird-checklist"
              ref={triggerRef}
              className={`inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-2 sm:px-3 h-8 sm:h-9 md:h-9 xl:h-9 shrink-0 pressable w-full transition-transform duration-150 ease-out hover:scale-[1.02] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand-navy)]`}
              onClick={() => setShowChecklist(v => !v)}
              onFocus={() => { /* intentionally do nothing on focus */ }}
              style={computedMaxWidth ? { maxWidth: `${computedMaxWidth}px`, transition: 'max-width 220ms ease' } : undefined}
            >
              <img src="/icons/Firebird.png" alt="Firebird icon" className="h-4 w-auto md:h-5 xl:h-5" />
              <span ref={barRef} className="relative inline-flex items-center flex-1 min-w-0 md:min-w-[160px] h-1.5 md:h-2 xl:h-2 rounded-full bg-gray-200 overflow-hidden">
                {/* Fill + one-time shimmer on completion */}
                <span className={`relative overflow-hidden h-full ${color}`} style={{ width: `${data.percent}%`, transition: 'width 200ms linear' }}>
                  {showShimmer && data.percent === 100 && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, #FFFFFF80 50%, transparent 100%)'
                      }}
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    />
                  )}
                </span>
              </span>
            </button>
          </Tooltip.Trigger>
          {data.percent !== 100 && (
            <Tooltip.Portal>
              <Tooltip.Content side="bottom" sideOffset={6} className="z-50 rounded bg-black/90 px-2 py-1 text-xs text-white shadow">
                <>Try recreating Stravinsky&apos;s epic finale from <em>The Firebird</em>! Click to see the piece performed.</>
                <Tooltip.Arrow className="fill-black/90" />
              </Tooltip.Content>
            </Tooltip.Portal>
          )}
        </Tooltip.Root>
      </Tooltip.Provider>

      {/* Single line under chip: only show congrats when complete */}
      {data.percent === 100 && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs md:text-sm whitespace-nowrap font-semibold text-[var(--color-brand-navy)]`}
        >
          <>Congratulations, Maestro! You did it!</>
        </div>
      )}

      <FirebirdVideoModal
        open={showChecklist}
        onClose={() => setShowChecklist(false)}
        triggerRef={triggerRef}
        videoEmbedUrl={"https://www.youtube.com/embed/QhAn7ZmI8_s?si=WB2kKQ5oi6gNHg0L&clip=UgkxhvkBP9dKGC_6-4hjijFG52Ft3dYT5dgr&clipt=EIDXRxi3oEg"}
      />
    </div>
  )
}
