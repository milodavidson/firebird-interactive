"use client"

import { useEffect } from 'react'
import { INSTRUMENTS } from '@/lib/instruments'
import { announcePolite } from '@/lib/a11y/announce'
import { usePartsStore } from '@/hooks/usePartsStore'
import { useAssignments } from '@/hooks/useAssignments'

export default function InstrumentList() {
  const { selectedInstrument, setSelectedInstrument } = usePartsStore()
  const { addInstrument } = useAssignments()

  // Clear selection with Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        setSelectedInstrument(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSelectedInstrument])

  return (
    <div className="flex flex-col">
      <p className="text-xs text-gray-600">Drag or tap to select, then tap a part.</p>
      <p className="sr-only">Keyboard: press Enter to select an instrument, then move to a part and press Enter to assign. Press Escape to cancel selection.</p>
      <ul className="mt-3 grid grid-cols-2 gap-3 md:block md:space-y-3 overflow-visible pt-1">
        {INSTRUMENTS.map(inst => (
          <li key={inst.id}>
            <button
              draggable
              data-instrument-id={inst.id}
              onDragStart={e => {
                e.dataTransfer.setData('text/instrumentId', inst.id)
                e.dataTransfer.setData('text/instrumentName', inst.name)
                try { e.dataTransfer.effectAllowed = 'move' } catch {}
              }}
              onClick={() => {
                if (selectedInstrument?.id === inst.id) {
                  setSelectedInstrument(null)
                } else {
                  setSelectedInstrument({ id: inst.id, name: inst.name })
                  announcePolite(`${inst.name} selected. Navigate to a part and press Enter to assign.`)
                }
              }}
              aria-pressed={selectedInstrument?.id === inst.id}
              className={`pressable w-full rounded-lg border px-4 py-3 text-left text-sm md:text-base transition hover:-translate-y-[1px] hover:bg-gray-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand-navy)] ${selectedInstrument?.id === inst.id ? 'border-[var(--color-brand-navy)] ring-1 ring-[var(--color-brand-navy)]' : 'border-gray-300'}`}
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

