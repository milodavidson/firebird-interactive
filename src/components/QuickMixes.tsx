"use client"

import { useState } from 'react'
import { usePartsStore } from '@/hooks/usePartsStore'
import { Feather, Megaphone, PartyPopper, Shuffle } from 'lucide-react'

type QuickMixKey = 'soft' | 'bold' | 'silly' | 'random'

export default function QuickMixes({ apply }: { apply: (key: QuickMixKey) => void }) {
  const [open, setOpen] = useState(false)
  const { play } = usePartsStore()

  return (
    <div className={`mt-3 ${play ? 'opacity-50 pointer-events-none' : 'opacity-100'}`} aria-disabled={play}>
  <div data-tour="instruments-divider" className="border-t border-gray-200 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Quick Mixes</h3>
          <button
            aria-expanded={open}
            aria-controls="quick-mixes-panel"
            onClick={() => setOpen(o => !o)}
            className="inline-flex items-center justify-center p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand-navy)]"
          >
            <svg
              className={`h-4 w-4 transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="sr-only">{open ? 'Collapse quick mixes' : 'Expand quick mixes'}</span>
          </button>
        </div>
      </div>

      <div
        id="quick-mixes-panel"
        className={`mt-1 overflow-hidden transition-[max-height,opacity,padding] duration-200 ${open ? 'max-h-96 opacity-100 pt-2' : 'max-h-0 opacity-0 pt-0'}`}
        aria-hidden={!open}
      >
        <div className="grid grid-cols-2 gap-3 overflow-visible">
          <button
            onClick={() => apply('soft')}
            disabled={play}
            className="pressable w-full rounded-lg border px-4 py-3 text-left text-sm md:text-base hover:-translate-y-[1px] hover:bg-gray-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand-navy)] border-gray-300"
            aria-label="Apply Soft quick mix"
          >
            <span className="flex items-center gap-2">
              <Feather size={24} strokeWidth={1} aria-hidden="true" className="flex-shrink-0 text-[var(--color-brand-navy)]" />
              <span className="font-medium">Soft</span>
            </span>
          </button>

          <button
            onClick={() => apply('bold')}
            disabled={play}
            className="pressable w-full rounded-lg border px-4 py-3 text-left text-sm md:text-base hover:-translate-y-[1px] hover:bg-gray-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand-navy)] border-gray-300"
            aria-label="Apply Bold quick mix"
          >
            <span className="flex items-center gap-2">
              <Megaphone size={24} strokeWidth={1} aria-hidden="true" className="flex-shrink-0 text-[var(--color-brand-navy)]" />
              <span className="font-medium">Bold</span>
            </span>
          </button>

          <button
            onClick={() => apply('silly')}
            disabled={play}
            className="pressable w-full rounded-lg border px-4 py-3 text-left text-sm md:text-base hover:-translate-y-[1px] hover:bg-gray-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand-navy)] border-gray-300"
            aria-label="Apply Silly quick mix"
          >
            <span className="flex items-center gap-2">
              <PartyPopper size={24} strokeWidth={1} aria-hidden="true" className="flex-shrink-0 text-[var(--color-brand-navy)]" />
              <span className="font-medium">Silly</span>
            </span>
          </button>

          <button
            onClick={() => apply('random')}
            disabled={play}
            className="pressable w-full rounded-lg border px-4 py-3 text-left text-sm md:text-base hover:-translate-y-[1px] hover:bg-gray-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand-navy)] border-gray-300"
            aria-label="Apply Random quick mix"
          >
            <span className="flex items-center gap-2">
              <Shuffle size={24} strokeWidth={1} aria-hidden="true" className="flex-shrink-0 text-[var(--color-brand-navy)]" />
              <span className="font-medium">Random</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
