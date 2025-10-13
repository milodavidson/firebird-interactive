'use client'

import { INSTRUMENTS } from '@/lib/instruments'
import { usePartsStore } from '@/hooks/usePartsStore'
import { useAssignments } from '@/hooks/useAssignments'

export default function InstrumentList() {
  const { selectedInstrument, setSelectedInstrument } = usePartsStore()
  const { addInstrument } = useAssignments()

  return (
    <div className="flex flex-col">
      <p className="text-xs text-gray-500">Drag to a part or tap to select, then tap a part.</p>
      <ul className="mt-3 grid grid-cols-2 gap-3 md:block md:space-y-3 overflow-visible pt-1">
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
              className={`pressable w-full rounded-lg border px-4 py-3 text-left text-sm md:text-base transition hover:-translate-y-[1px] hover:bg-gray-50 hover:shadow-sm ${selectedInstrument?.id === inst.id ? 'border-[var(--color-brand-navy)] ring-1 ring-[var(--color-brand-navy)]' : 'border-gray-300'}`}
            >
              <span className="flex items-center gap-2">
                <InstrumentFamilyIconInline id={inst.id} name={inst.name} />
                <span>{inst.name}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function InstrumentFamilyIconInline({ id, name }: { id: string; name: string }) {
  let src = ''
  switch (id) {
    case 'woodwind': src = '/icons/woodwind.png'; break
    case 'brass': src = '/icons/brass.png'; break
    case 'percussion': src = '/icons/percussion.png'; break
    case 'strings': src = '/icons/strings.png'; break
    default: return null
  }
  return <img src={src} alt={`${name} icon`} className="h-5 w-auto md:h-6 select-none shrink-0" draggable={false} />
}

