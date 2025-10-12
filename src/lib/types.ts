export type Tempo = 'fast' | 'slow'

export interface Instrument {
  id: string
  name: string
  family?: string
}

export interface AssignedInstrument {
  id: string // unique instance id e.g., "{partId}-{instrumentId}-{timestamp}"
  instrumentId: string
  name: string
  softFile: string
  loudFile: string
  volumeBalance: number // 0..100
  isMuted: boolean
  isLoading?: boolean
  hasError?: boolean
  queueTimeRemaining?: number
  queueStartTime?: number
  queueScheduleTime?: number
}

export type PartId = 'melody' | 'harmony' | 'rhythm' | 'texture'

export interface MusicalPart {
  id: PartId
  name: string
  assignedInstruments: AssignedInstrument[]
}

export interface AudioInspectorSnapshot {
  getAudioBuffers: () => Record<string, { soft?: boolean | AudioBuffer | null; loud?: boolean | AudioBuffer | null }>
  getAudioBuffersByTempo: () => Record<string, { fast?: { soft?: boolean; loud?: boolean }; slow?: { soft?: boolean; loud?: boolean } }>
  getNodeStartTimes: () => Record<string, { soft?: number; loud?: number }>
  getDeferredQueue: () => { id: string; instrumentId: string; queueStartTime: number; queueTimeRemaining: number }[]
  getPlayState: () => boolean
  getParts: () => MusicalPart[]
  scheduledTempoSwitch?: { targetTempo: Tempo; scheduleTime?: number } | null
  getTransportStartTime: () => number | null
  getTempo: () => Tempo
}

export interface GainPair { soft: GainNode; loud: GainNode }
