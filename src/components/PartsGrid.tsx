'use client'

import { usePartsStore } from '@/hooks/usePartsStore'
import PartCard from '@/components/PartCard'

export default function PartsGrid() {
  const { parts } = usePartsStore()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {parts.map((p) => (
        <PartCard key={p.id} partId={p.id} />
      ))}
    </div>
  )
}
