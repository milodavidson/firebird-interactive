'use client'

import { INSTRUMENTS } from '@/lib/instruments'
import { usePartsStore } from '@/hooks/usePartsStore'
import { useAssignments } from '@/hooks/useAssignments'

export default function InstrumentList() {
  const { selectedInstrument, setSelectedInstrument } = usePartsStore()
  const { addInstrument } = useAssignments()

  return (
    <div>
      <h3>Instruments</h3>
      <p style={{ color: '#777' }}>Drag to a part or tap to select, then tap a part.</p>
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {INSTRUMENTS.map(inst => (
          <li key={inst.id}>
            <button
              draggable
              onDragStart={e => {
                e.dataTransfer.setData('text/instrumentId', inst.id)
                e.dataTransfer.setData('text/instrumentName', inst.name)
              }}
              onClick={() => setSelectedInstrument({ id: inst.id, name: inst.name })}
              aria-pressed={selectedInstrument?.id === inst.id}
              style={{
                border: selectedInstrument?.id === inst.id ? '2px solid #333' : '1px solid #ccc',
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
  )
}

