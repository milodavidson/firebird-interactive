"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import { audioService } from '@/lib/audio/AudioService'
import { usePartsStore } from '@/hooks/usePartsStore'
import { secondsPerBeat, loopDuration, computeWithinLoopBeatAtTime } from '@/lib/audio/audioUtils'

type Props = {
  size?: number
  stroke?: number
  onToggle: () => void
}

export function LoopProgress({ size = 72, stroke = 6, onToggle }: Props) {
  const { play, currentTempoRef, transportStartRef, tempo: uiTempo } = usePartsStore()
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const [progress, setProgress] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const tick = () => {
      const ctx = audioService.audioCtx
      const start = transportStartRef.current
      const tempo = currentTempoRef.current
      if (!ctx || start == null) {
        setProgress(0)
      } else {
        const now = ctx.currentTime
        const dur = loopDuration(tempo)
        const elapsed = Math.max(0, (now - start) % dur)
        const p = Math.min(1, elapsed / dur)
        setProgress(p)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [currentTempoRef, transportStartRef])

  const dashOffset = useMemo(() => {
    return circumference * (1 - progress)
  }, [circumference, progress])

  const strokeColor = uiTempo === 'fast' ? 'var(--color-brand-red)' : 'var(--color-brand-navy)'
  return (
    <button
      aria-label={play ? 'Pause' : 'Play'}
      onClick={onToggle}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-brand-navy)] text-white shadow">
          {play ? <Pause size={18} /> : <Play size={18} className="translate-x-[1px]" />}
        </span>
      </span>
    </button>
  )
}

export default LoopProgress