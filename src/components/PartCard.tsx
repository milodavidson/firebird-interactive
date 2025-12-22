'use client'

import { usePartsStore } from '@/hooks/usePartsStore'
import { useAssignments } from '@/hooks/useAssignments'
import AssignedInstrument from '@/components/AssignedInstrument'
import { AnimatePresence, motion } from 'framer-motion'
import { Music, Drum, Waves, Piano } from 'lucide-react'
import { useRef } from 'react'
import * as styles from './PartCard.css'

export default function PartCard({ partId }: { partId: 'melody' | 'harmony' | 'rhythm' | 'texture' }) {
  const { parts } = usePartsStore()
  const { addInstrument, removeInstrument } = useAssignments()
  const { selectedInstrument, setSelectedInstrument } = usePartsStore()
  const part = parts.find((p) => p.id === partId)
  if (!part) return null
  const atCapacity = part.assignedInstruments.length >= 4
  const isEmpty = part.assignedInstruments.length === 0
  const placeholderTexts: Record<'melody' | 'harmony' | 'rhythm' | 'texture', string> = {
    melody: "The main tune of the music—the part you'd hum.",
    harmony: 'Notes that move with the melody to make it sound rich and powerful.',
    rhythm: 'The steady beats that give music its drive and strength.',
    texture: 'The sparkle and shimmer that make music feel alive.',
  }
  const placeholderText = placeholderTexts[partId]
  const dragDepthRef = useRef(0)
  return (
    <motion.div
      layout
      data-tour={`part-${part.id}`}
      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.7 }}
      role="button"
      tabIndex={0}
      onDragOverCapture={e => {
        // Capture-phase fallback so fast drags still show feedback
        const el = e.currentTarget as HTMLDivElement
        el.classList.add(styles.cardDragOver)
      }}
      onDragOver={e => {
        e.preventDefault()
        try { e.dataTransfer.dropEffect = 'move' } catch {}
        const el = e.currentTarget as HTMLDivElement
        el.classList.add(styles.cardDragOver)
      }}
      onDragEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        try { e.dataTransfer.dropEffect = 'move' } catch {}
        dragDepthRef.current += 1
        el.classList.add(styles.cardDragOver)
      }}
      onDragLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
        if (dragDepthRef.current === 0) {
          el.classList.remove(styles.cardDragOver)
        }
      }}
      onDrop={e => {
        const el = e.currentTarget as HTMLDivElement
        const instrumentId = e.dataTransfer.getData('text/instrumentId')
        const instrumentName = e.dataTransfer.getData('text/instrumentName')
        dragDepthRef.current = 0
        el.classList.remove(styles.cardDragOver)
        if (instrumentId) {
          // prevent duplicates and capacity
          if (part.assignedInstruments.some(ai => ai.instrumentId === instrumentId) || atCapacity) {
            // denial shake
            el.classList.add(styles.shake)
            setTimeout(() => { if (el && el.isConnected) el.classList.remove(styles.shake) }, 220)
            return
          }
          addInstrument(partId, instrumentId, instrumentName)
        }
      }}
      onClick={() => {
        if (selectedInstrument) {
          const instId = selectedInstrument.id
          if (part.assignedInstruments.some(ai => ai.instrumentId === instId) || atCapacity) {
            const el = (document.querySelector(`[data-testid="part-${part.id}"]`) as HTMLElement)?.closest('div') as HTMLDivElement | null
            if (el) {
              el.classList.add(styles.shake)
              setTimeout(() => { if (el && el.isConnected) el.classList.remove(styles.shake) }, 220)
            }
            return
          }
          addInstrument(partId, instId, selectedInstrument.name)
          setSelectedInstrument(null)
        }
      }}
      onKeyDown={(e) => {
        const target = e.target as HTMLElement | null
        const tag = (target?.tagName || '').toLowerCase()
        const isInteractive = tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea' || !!target?.isContentEditable
        if (isInteractive) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          const el = e.currentTarget as HTMLDivElement
          el.click()
        }
      }}
      className={styles.card}
    >
      <div className={styles.header} data-testid={`part-${part.id}`}>
        <span className={styles.headerInner}>
          <PartIcon partId={part.id} />
          <span>{part.name}</span>
        </span>
      </div>
  <ul className={styles.list}>
        {/* Always mounted placeholder that fades/collapses when not empty */}
        <motion.li
          key="empty"
          initial={false}
          animate={{ opacity: isEmpty ? 1 : 0, height: isEmpty ? 'auto' : 0, y: isEmpty ? 0 : -2 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ overflow: 'hidden' }}
          className={`${styles.placeholderItem} ${isEmpty ? '' : styles.placeholderItemHidden}`}
        >
          {placeholderText}
        </motion.li>
        {/* Items animate independently; only removed item exits */}
        <AnimatePresence initial={false} mode="sync">
          {part.assignedInstruments.map((inst) => (
            <motion.li
              key={inst.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28, mass: 0.6 }}
              className={styles.assignedItem}
            >
              <AssignedInstrument inst={inst} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  )
}

function PartIcon({ partId }: { partId: 'melody' | 'harmony' | 'rhythm' | 'texture' }) {
  const stroke = 1.0
  switch (partId) {
    case 'melody':
      return <Music className={styles.iconBase} strokeWidth={stroke} aria-hidden="true" />
    case 'harmony':
      return <Piano className={styles.iconBase} strokeWidth={stroke} aria-hidden="true" />
    case 'rhythm':
      // Prefer Drum if available; fallback to Timer for a ticking metaphor
      return <Drum className={styles.iconBase} strokeWidth={stroke} aria-hidden="true" />
    case 'texture':
      return <Waves className={styles.iconBase} strokeWidth={stroke} aria-hidden="true" />
    default:
      return null
  }
}
