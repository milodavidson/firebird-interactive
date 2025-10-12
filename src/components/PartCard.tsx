'use client'

import { usePartsStore } from '@/hooks/usePartsStore'
import { useAssignments } from '@/hooks/useAssignments'
import AssignedInstrument from '@/components/AssignedInstrument'
import { AnimatePresence, motion } from 'framer-motion'

export default function PartCard({ partId }: { partId: 'melody' | 'harmony' | 'rhythm' | 'texture' }) {
  const { parts } = usePartsStore()
  const { addInstrument, removeInstrument } = useAssignments()
  const { selectedInstrument, setSelectedInstrument } = usePartsStore()
  const part = parts.find((p) => p.id === partId)
  if (!part) return null
  const atCapacity = part.assignedInstruments.length >= 4
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.7 }}
      onDragOver={e => e.preventDefault()}
      onDragOverCapture={e => {
        const el = e.currentTarget as HTMLDivElement
        el.classList.add('ring-2','ring-[var(--color-brand-navy)]','shadow-md')
      }}
      onDragEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.classList.add('ring-2','ring-[var(--color-brand-navy)]','shadow-md')
      }}
      onDragLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.classList.remove('ring-2','ring-[var(--color-brand-navy)]','shadow-md')
      }}
      onDrop={e => {
        const el = e.currentTarget as HTMLDivElement
        const instrumentId = e.dataTransfer.getData('text/instrumentId')
        const instrumentName = e.dataTransfer.getData('text/instrumentName')
        el.classList.remove('ring-2','ring-[var(--color-brand-navy)]','shadow-md')
        if (instrumentId) {
          // prevent duplicates and capacity
          if (part.assignedInstruments.some(ai => ai.instrumentId === instrumentId) || atCapacity) {
            // denial shake
            el.classList.add('animate-shake-x')
            setTimeout(() => { if (el && el.isConnected) el.classList.remove('animate-shake-x') }, 220)
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
              el.classList.add('animate-shake-x')
              setTimeout(() => { if (el && el.isConnected) el.classList.remove('animate-shake-x') }, 220)
            }
            return
          }
          addInstrument(partId, instId, selectedInstrument.name)
          setSelectedInstrument(null)
        }
      }}
      className={`rounded-lg border p-3 transition ${atCapacity ? 'opacity-60' : ''}`}
    >
      <div className="mb-2 font-semibold" data-testid={`part-${part.id}`}>{part.name} {atCapacity ? '· full' : ''}</div>
      <ul className="list-none pl-0 space-y-2">
        <AnimatePresence initial={false} mode="wait">
          {part.assignedInstruments.length === 0 ? (
            <motion.li
              key="empty"
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ type: 'tween', duration: 0.15 }}
              className="text-sm text-gray-500"
            >
              Drop or tap to add
            </motion.li>
          ) : (
            part.assignedInstruments.map((inst) => (
              <motion.li
                key={inst.id}
                layout
                initial={{ opacity: 0, y: 6, backgroundColor: 'rgba(255, 255, 255, 0)' }}
                animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(255, 255, 255, 0)' }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28, mass: 0.6 }}
              >
                <AssignedInstrument inst={inst} />
              </motion.li>
            ))
          )}
        </AnimatePresence>
      </ul>
    </motion.div>
  )
}
