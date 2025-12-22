"use client"

import { useEffect } from 'react'
import { INSTRUMENTS } from '@/lib/instruments'
import { announcePolite } from '@/lib/a11y/announce'
import { usePartsStore } from '@/hooks/usePartsStore'
import { useAssignments } from '@/hooks/useAssignments'
import QuickMixes from './QuickMixes'
import * as styles from './InstrumentList.css'

export default function InstrumentList() {
  const { selectedInstrument, setSelectedInstrument } = usePartsStore()
  const { addInstrument, removeInstrument } = useAssignments()
  const store = usePartsStore()

  async function applyQuickMix(key: 'soft' | 'bold' | 'silly' | 'random') {
  // Remove all current instances
  const currentParts = store.partsRef.current
  const toRemove: string[] = []
  currentParts.forEach(p => p.assignedInstruments.forEach(ai => toRemove.push(ai.id)))
  toRemove.forEach(id => removeInstrument(id))

    // Helper to add and then set per-instance properties
    async function addAndUpdate(partId: string, instrumentId: string, volume = 0, isMuted = false) {
      const instId = await addInstrument(partId as any, instrumentId, instrumentId)
      if (!instId) return
      // After add, update the parts store to set volumeBalance and isMuted
      store.setParts(prev => prev.map(p => p.id === partId ? { ...p, assignedInstruments: p.assignedInstruments.map(ai => ai.id === instId ? { ...ai, volumeBalance: volume, isMuted } : ai) } : p))
    }

    if (key === 'soft') {
      store.setTempo('slow')
      // Soft: Woodwind on Melody, Strings on Harmony, Woodwind and Percussion on Rhythm, volumes all 0
      await addAndUpdate('melody', 'woodwind', 0, false)
      await addAndUpdate('harmony', 'strings', 0, false)
      await addAndUpdate('rhythm', 'woodwind', 0, false)
      await addAndUpdate('rhythm', 'percussion', 0, false)
    }

    if (key === 'bold') {
      store.setTempo('slow')
      // Bold: melody: Brass and Strings full volume
      await addAndUpdate('melody', 'brass', 100, false)
      await addAndUpdate('melody', 'strings', 100, false)
      // harmony: Brass and Strings full
      await addAndUpdate('harmony', 'brass', 100, false)
      await addAndUpdate('harmony', 'strings', 100, false)
      // rhythm: Percussion, Brass, Strings full
      await addAndUpdate('rhythm', 'percussion', 100, false)
      await addAndUpdate('rhythm', 'brass', 100, false)
      await addAndUpdate('rhythm', 'strings', 100, false)
      // texture: Percussion, Strings, Woodwind — percussion and strings 50%, woodwind 100%
      await addAndUpdate('texture', 'percussion', 50, false)
      await addAndUpdate('texture', 'strings', 50, false)
      await addAndUpdate('texture', 'woodwind', 100, false)
    }

    if (key === 'silly') {
      store.setTempo('fast')
      // Silly: Percussion on all parts, volumes 100
      await addAndUpdate('melody', 'percussion', 100, false)
      await addAndUpdate('harmony', 'percussion', 100, false)
      await addAndUpdate('rhythm', 'percussion', 100, false)
      await addAndUpdate('texture', 'percussion', 100, false)
    }

    if (key === 'random') {
      // Random tempo
      store.setTempo(Math.random() > 0.5 ? 'fast' : 'slow')
      const choices = ['brass', 'strings', 'woodwind', 'percussion']
      const parts = ['melody', 'harmony', 'rhythm', 'texture']
      for (const partId of parts) {
        // pick 1-2 instruments randomly to add (cap at 2)
        const count = Math.floor(Math.random() * 2) + 1
        const picked: string[] = []
        while (picked.length < count) {
          const pick = choices[Math.floor(Math.random() * choices.length)]
          if (!picked.includes(pick)) picked.push(pick)
        }
        for (const inst of picked) {
          const vol = Math.floor(Math.random() * 101) // 0..100
          await addAndUpdate(partId, inst, vol, false)
        }
      }
    }
  }

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
    <div className={styles.container}>
      <p className={styles.helpText}>Drag or tap to select, then tap a part.</p>
      <p className={styles.srOnly}>Keyboard: press Enter to select an instrument, then move to a part and press Enter to assign. Press Escape to cancel selection.</p>
      <ul className={styles.list}>
        {INSTRUMENTS.map(inst => (
          <li key={inst.id} className={styles.listItem}>
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
              className={styles.instrumentButton({ selected: selectedInstrument?.id === inst.id })}
            >
              <span className={styles.buttonContent}>
                <InstrumentFamilyIconInline id={inst.id} name={inst.name} />
                <span>{inst.name}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <QuickMixes apply={applyQuickMix} />
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
  return <img src={src} alt={`${name} icon`} className={styles.icon} draggable={false} />
}

