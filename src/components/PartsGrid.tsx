'use client'

import { usePartsStore } from '@/hooks/usePartsStore'
import PartCard from '@/components/PartCard'

export default function PartsGrid() {
  const { parts } = usePartsStore()
  return (
  <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-2 auto-rows-auto lg:auto-rows-fr lg:h-full">
      {parts.map((p) => (
        <div key={p.id} className="h-auto lg:h-full"><PartCard partId={p.id} /></div>
      ))}
    </div>
  )
}
