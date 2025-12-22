'use client'

import { usePartsStore } from '@/hooks/usePartsStore'
import PartCard from '@/components/PartCard'
import * as styles from './PartsGrid.css'

export default function PartsGrid() {
  const { parts } = usePartsStore()
  return (
    <div className={styles.grid}>
      {parts.map((p) => (
        <div key={p.id} className={styles.gridItem}><PartCard partId={p.id} /></div>
      ))}
    </div>
  )
}
