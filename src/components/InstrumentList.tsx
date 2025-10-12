'use client'

import { INSTRUMENTS_BY_PART, PARTS } from '@/lib/instruments'
import { usePartsStore } from '@/hooks/usePartsStore'
import { useAssignments } from '@/hooks/useAssignments'

export default function InstrumentList() {
  const { selectedInstrument, setSelectedInstrument } = usePartsStore()
  const { addInstrument } = useAssignments()

  return (
    <div>
      <h3>Instruments</h3>
      <p style={{ color: '#777' }}>Drag to a part or tap to select, then tap a part.</p>
      {PARTS.map(partId => (
        <div key={partId} style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 4, textTransform: 'capitalize' }}>{partId}</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {INSTRUMENTS_BY_PART[partId].map(inst => (
              <li key={`${partId}-${inst.id}`}>
                <button
                  draggable
                  onDragStart={e => {
                    e.dataTransfer.setData('text/partId', partId)
                    e.dataTransfer.setData('text/instrumentId', inst.id)
                    e.dataTransfer.setData('text/instrumentName', inst.name)
                  }}
                  onClick={() => setSelectedInstrument({ id: `${partId}:${inst.id}`, name: inst.name })}
                  aria-pressed={selectedInstrument?.id === `${partId}:${inst.id}`}
                  style={{
                    border: selectedInstrument?.id === `${partId}:${inst.id}` ? '2px solid #333' : '1px solid #ccc',
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {inst.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

