'use client'

import { usePartsStore } from '@/hooks/usePartsStore'
import PartCard from '@/components/PartCard'

export default function PartsGrid() {
  const { parts } = usePartsStore()
  return (
  <div className="min-h-0 grid grid-cols-1 gap-3 lg:h-full">
      {/**
       * Break parts into rows of 2 so each row is its own grid.
       * This ensures cards only match height within the same row
       * instead of forcing every row to match the tallest item.
       */}
      {(() => {
        const rows: typeof parts[] = []
        for (let i = 0; i < parts.length; i += 2) rows.push(parts.slice(i, i + 2))
        return rows.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-1 gap-3 lg:grid-cols-2 min-h-0 lg:h-full">
            {row.map((p) => (
              <div key={p.id} className="h-auto lg:h-full min-h-0"><PartCard partId={p.id} /></div>
            ))}
          </div>
        ))
      })()}
    </div>
  )
}
