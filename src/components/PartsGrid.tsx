'use client'

import { usePartsStore } from '@/hooks/usePartsStore'
import PartCard from '@/components/PartCard'

export default function PartsGrid() {
  const { parts } = usePartsStore()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {parts.map((p) => (
        <PartCard key={p.id} partId={p.id} />
      ))}
    </div>
  )
}
