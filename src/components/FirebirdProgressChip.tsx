"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Minus } from 'lucide-react'
import { usePartsStore } from '@/hooks/usePartsStore'

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
  const containerRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLSpanElement | null>(null)
  const [anchorLeft, setAnchorLeft] = useState<number | null>(null)
  const [showShimmer, setShowShimmer] = useState(false)

  const data = useMemo(() => {
    // Revised scoring: 1 point for each required instrument present (9),
    // +1 point for each required instrument at 100 loud (9), +1 for tempo fast (1) => total 19
    const partIds: PartId[] = ['melody','harmony','rhythm','texture']
    const requiredTotal = FIREBIRD_REQ.melody.length + FIREBIRD_REQ.harmony.length + FIREBIRD_REQ.rhythm.length + FIREBIRD_REQ.texture.length // 9
    let presentCount = 0
    let loudCount = 0

    // Details for checklist
    const presenceDetails: { part: PartId; inst: string; status: 'missing' | 'present-not-loud' | 'loud' }[] = []
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
    }
    const tempoOk = tempo === 'fast'
    const anyAssigned = parts.some(p => p.assignedInstruments.length > 0)
    const points = presentCount + loudCount + (tempoOk && anyAssigned ? 1 : 0)
    const totalPoints = requiredTotal * 2 + 1 // 19
    const percent = Math.round((points / totalPoints) * 100)
    return { percent, points, totalPoints, presentCount, loudCount, requiredTotal, tempoOk, presenceDetails }
  }, [parts, tempo])

  // Trigger shimmer on reaching 100%
  const prevPercent = useRef<number>(0)
  useEffect(() => {
    if (prevPercent.current < 100 && data.percent === 100) {
      // Trigger a single-pass shimmer overlay
      setShowShimmer(true)
      const t2 = setTimeout(() => setShowShimmer(false), 900) // match shimmer duration (~0.8s) with small buffer
      return () => { clearTimeout(t2) }
    }
    prevPercent.current = data.percent
  }, [data.percent])

  // Close checklist on outside click / ESC
  useEffect(() => {
    if (!showChecklist) return
    const onDoc = (e: MouseEvent) => {
      const el = containerRef.current
      if (el && !el.contains(e.target as Node)) setShowChecklist(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowChecklist(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [showChecklist])

  // Position checklist centered under the progress bar
  useEffect(() => {
    if (!showChecklist) return
    const computeAnchor = () => {
      const cont = containerRef.current
      const bar = barRef.current
      if (!cont || !bar) return
      const c = cont.getBoundingClientRect()
      const b = bar.getBoundingClientRect()
      setAnchorLeft(b.left - c.left + b.width / 2)
    }
    computeAnchor()
    window.addEventListener('resize', computeAnchor)
    return () => window.removeEventListener('resize', computeAnchor)
  }, [showChecklist])

  // Progress bar color shifts
  const color = data.percent >= 100 ? 'bg-[var(--color-brand-red)]' : 'bg-[var(--color-brand-navy)]'

  return (
  <div ref={containerRef} className="relative inline-flex items-center w-full">
            <button
              type="button"
              aria-label={`Firebird progress ${data.points} of ${data.totalPoints}`}
              className={`inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-2.5 sm:px-3 h-9 md:h-9 xl:h-9 shrink-0 pressable w-full md:max-w-[540px] lg:max-w-[680px] xl:max-w-[820px] transition-transform duration-150 ease-out hover:scale-[1.02] hover:shadow`}
              onClick={() => setShowChecklist(v => !v)}
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

      {/* Single line under chip: swaps instruction with congrats when complete */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs md:text-sm whitespace-nowrap ${data.percent === 100 ? 'font-semibold text-[var(--color-brand-navy)]' : 'text-gray-700'}`}
      >
        {data.percent === 100 ? (
          <>Congratulations, Maestro! You did it!</>
        ) : (
          <>Try recreating Stravinsky&apos;s epic finale from <em>The Firebird</em>!</>
        )}
      </div>

      {showChecklist && (
        <div
          role="dialog"
          aria-label="Firebird checklist"
          className="absolute z-20 -translate-x-1/2 mt-3 w-64 md:w-72 rounded-lg border border-gray-200 bg-white shadow-lg p-3 text-sm text-center"
          style={{ left: anchorLeft != null ? `${anchorLeft}px` : '50%', top: '100%' }}
        >
          <div className="font-semibold mb-1"> <em>Firebird</em> checklist</div>
          <ul className="space-y-1">
            <li className="flex items-center justify-center gap-2">
              {data.tempoOk ? <Check size={14} /> : <X size={14} />}
              <span>Tempo: Fast</span>
            </li>
          </ul>
          <div className="mt-2 font-semibold">Parts</div>
          <ul className="mt-1 space-y-1 text-left inline-block">
            {data.presenceDetails.map((d, i) => (
              <li key={`${d.part}-${d.inst}-${i}`} className="flex items-center gap-2">
                {d.status === 'loud' ? <Check size={14} /> : d.status === 'present-not-loud' ? <Minus size={14} /> : <X size={14} />}
                <span className="capitalize">{d.part}:</span>
                <span>{d.inst}</span>
                {d.status === 'present-not-loud' && <span className="text-gray-500">(make it loud!)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
