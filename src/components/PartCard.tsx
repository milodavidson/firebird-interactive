'use client'

import { usePartsStore } from '@/hooks/usePartsStore'
import { useAssignments } from '@/hooks/useAssignments'
import AssignedInstrument from '@/components/AssignedInstrument'

export default function PartCard({ partId }: { partId: 'melody' | 'harmony' | 'rhythm' | 'texture' }) {
  const { parts } = usePartsStore()
  const { addInstrument, removeInstrument } = useAssignments()
  const { selectedInstrument, setSelectedInstrument } = usePartsStore()
  const part = parts.find((p) => p.id === partId)
  if (!part) return null
  const atCapacity = part.assignedInstruments.length >= 4
  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        const instrumentId = e.dataTransfer.getData('text/instrumentId')
        const instrumentName = e.dataTransfer.getData('text/instrumentName')
        if (instrumentId) {
          // prevent duplicates and capacity
          if (part.assignedInstruments.some(ai => ai.instrumentId === instrumentId)) return
          if (atCapacity) return
          addInstrument(partId, instrumentId, instrumentName)
        }
      }}
      onClick={() => {
        if (selectedInstrument) {
          const instId = selectedInstrument.id
          if (part.assignedInstruments.some(ai => ai.instrumentId === instId)) return
          if (atCapacity) return
          addInstrument(partId, instId, selectedInstrument.name)
          setSelectedInstrument(null)
        }
      }}
      className={`rounded-lg border p-3 ${atCapacity ? 'opacity-60' : ''}`}
    >
      <div className="mb-2 font-semibold" data-testid={`part-${part.id}`}>{part.name} {atCapacity ? '· full' : ''}</div>
      {part.assignedInstruments.length === 0 ? (
        <div className="text-sm text-gray-500">Drop or tap to add</div>
      ) : (
        <ul className="ml-4 list-disc">
          {part.assignedInstruments.map((inst) => (
            <li key={inst.id} className="mb-2">
              <AssignedInstrument inst={inst} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
