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
        const dropPartId = e.dataTransfer.getData('text/partId') as 'melody' | 'harmony' | 'rhythm' | 'texture'
        const instrumentId = e.dataTransfer.getData('text/instrumentId')
        const instrumentName = e.dataTransfer.getData('text/instrumentName')
        if (dropPartId && instrumentId) {
          // prevent duplicates and capacity
          if (part.assignedInstruments.some(ai => ai.instrumentId === instrumentId)) return
          if (atCapacity) return
          addInstrument(partId, instrumentId, instrumentName)
        }
      }}
      onClick={() => {
        if (selectedInstrument) {
          const [selPart, instId] = selectedInstrument.id.split(':')
          if (selPart === partId) {
            if (part.assignedInstruments.some(ai => ai.instrumentId === instId)) return
            if (atCapacity) return
            addInstrument(partId, instId, selectedInstrument.name)
            setSelectedInstrument(null)
          }
        }
      }}
      style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, opacity: atCapacity ? 0.6 : 1 }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }} data-testid={`part-${part.id}`}>{part.name} {atCapacity ? '(full)' : ''}</div>
      {part.assignedInstruments.length === 0 ? (
        <div style={{ color: '#888' }}>Drop or tap to add</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {part.assignedInstruments.map((inst) => (
            <li key={inst.id} style={{ marginBottom: 8 }}>
              <AssignedInstrument inst={inst} />
              <button onClick={() => removeInstrument(inst.id)} aria-label={`Remove ${inst.name}`} style={{ marginTop: 4 }}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
