'use client'

import { usePartsStore } from '@/hooks/usePartsStore'
import PartCard from '@/components/PartCard'

export default function PartsGrid() {
  const { parts } = usePartsStore()
  return (
  <div className="grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-2 auto-rows-fr">
      {parts.map((p) => (
        <div key={p.id} className="h-full"><PartCard partId={p.id} /></div>
      ))}
    </div>
  )
}
