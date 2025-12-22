"use client"

import { useState } from 'react'
import { usePartsStore } from '@/hooks/usePartsStore'
import { Feather, Megaphone, PartyPopper, Shuffle } from 'lucide-react'
import * as styles from './QuickMixes.css'

type QuickMixKey = 'soft' | 'bold' | 'silly' | 'random'

export default function QuickMixes({ apply }: { apply: (key: QuickMixKey) => void }) {
  const [open, setOpen] = useState(false)
  const { play } = usePartsStore()

  return (
    <div className={styles.container({ disabled: play })} aria-disabled={play}>
      <div data-tour="instruments-divider" className={styles.divider}>
        <div className={styles.header}>
          <h3 className={styles.title}>Quick Mixes</h3>
          <button
            aria-expanded={open}
            aria-controls="quick-mixes-panel"
            onClick={() => setOpen(o => !o)}
            className={styles.toggleButton}
          >
            <svg
              className={styles.chevron({ open })}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={styles.srOnly}>{open ? 'Collapse quick mixes' : 'Expand quick mixes'}</span>
          </button>
        </div>
      </div>

      <div
        id="quick-mixes-panel"
        className={styles.panel({ open })}
        aria-hidden={!open}
      >
        <div className={styles.grid}>
          <button
            onClick={() => apply('soft')}
            disabled={play}
            className={styles.mixButton}
            aria-label="Apply Soft quick mix"
          >
            <span className={styles.buttonContent}>
              <Feather size={24} strokeWidth={1} aria-hidden="true" className={styles.icon} />
              <span className={styles.label}>Soft</span>
            </span>
          </button>

          <button
            onClick={() => apply('bold')}
            disabled={play}
            className={styles.mixButton}
            aria-label="Apply Bold quick mix"
          >
            <span className={styles.buttonContent}>
              <Megaphone size={24} strokeWidth={1} aria-hidden="true" className={styles.icon} />
              <span className={styles.label}>Bold</span>
            </span>
          </button>

          <button
            onClick={() => apply('silly')}
            disabled={play}
            className={styles.mixButton}
            aria-label="Apply Silly quick mix"
          >
            <span className={styles.buttonContent}>
              <PartyPopper size={24} strokeWidth={1} aria-hidden="true" className={styles.icon} />
              <span className={styles.label}>Silly</span>
            </span>
          </button>

          <button
            onClick={() => apply('random')}
            disabled={play}
            className={styles.mixButton}
            aria-label="Apply Random quick mix"
          >
            <span className={styles.buttonContent}>
              <Shuffle size={24} strokeWidth={1} aria-hidden="true" className={styles.icon} />
              <span className={styles.label}>Random</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
