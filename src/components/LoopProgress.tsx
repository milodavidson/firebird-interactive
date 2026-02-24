"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { audioService } from '@/lib/audio/AudioService'
import { usePartsStore } from '@/hooks/usePartsStore'
import { secondsPerBeat, loopDuration, computeWithinLoopBeatAtTime } from '@/lib/audio/audioUtils'
import { vars } from '@/styles/theme.css'
import * as styles from './LoopProgress.css'

type Props = {
  size?: number
  stroke?: number
  onToggle: () => void
  disabled?: boolean
}

export function LoopProgress({ size = 72, stroke = 6, onToggle, disabled = false }: Props) {
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

  const strokeColor = uiTempo === 'fast' ? vars.color.brandRed : vars.color.brandNavy
  return (
    <Tooltip.Provider>
      <Tooltip.Root open={disabled ? undefined : false} delayDuration={0}>
        <Tooltip.Trigger asChild>
          <button
            aria-label={play ? 'Pause' : 'Play'}
            onClick={onToggle}
            disabled={disabled}
            className={styles.button}
            style={{ width: size, height: size }}
          >
            <svg width={size} height={size} className={styles.svg}>
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
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className={styles.progressCircle}
                style={{ stroke: strokeColor }}
              />
            </svg>
            <span className={styles.innerButtonWrapper}>
              <span className={styles.innerButton({ disabled })}>
                {play ? <Pause size={18} aria-hidden="true" /> : <Play size={18} className={styles.playIcon} aria-hidden="true" />}
              </span>
            </span>
          </button>
        </Tooltip.Trigger>

        {disabled && (
          <Tooltip.Portal>
            <Tooltip.Content side="bottom" sideOffset={6} className={styles.tooltipContent}>
              Add an instrument to play.
              <Tooltip.Arrow className={styles.tooltipArrow} />
            </Tooltip.Content>
          </Tooltip.Portal>
        )}
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default LoopProgress