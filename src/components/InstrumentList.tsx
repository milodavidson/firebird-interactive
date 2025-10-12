'use client'

import { INSTRUMENTS } from '@/lib/instruments'
import { usePartsStore } from '@/hooks/usePartsStore'
import { useAssignments } from '@/hooks/useAssignments'

export default function InstrumentList() {
  const { selectedInstrument, setSelectedInstrument } = usePartsStore()
  const { addInstrument } = useAssignments()

  return (
    <div>
      <p className="text-xs text-gray-500">Drag to a part or tap to select, then tap a part.</p>
      <ul className="mt-2 grid grid-cols-2 gap-2 md:block md:space-y-2">
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
              className={`pressable w-full rounded-md border px-3 py-2 text-left text-sm transition hover:-translate-y-[1px] hover:bg-gray-50 hover:shadow-sm ${selectedInstrument?.id === inst.id ? 'border-[var(--color-brand-navy)] ring-1 ring-[var(--color-brand-navy)]' : 'border-gray-300'}`}
            >
              {inst.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

