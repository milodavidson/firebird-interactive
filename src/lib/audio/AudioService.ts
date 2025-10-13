import { applyDecodeFades } from './audioUtils'
import type { GainPair, Tempo, AudioInspectorSnapshot } from '@/lib/types'

type BufferByUrl = Map<string, AudioBuffer>

export class AudioService {
  audioCtx: AudioContext | null = null
  private bufferCache: BufferByUrl = new Map()
  private baseGains: Map<string, GainPair> = new Map()
  private limiter: DynamicsCompressorNode | null = null
  private destination: AudioNode | null = null

  // active nodes per instance and type
  private activeNodes: Map<string, { soft?: { src: AudioBufferSourceNode; gain: GainNode }; loud?: { src: AudioBufferSourceNode; gain: GainNode } }> = new Map()

  // buffers by instance id and tempo
  private buffersByInstTempo: Map<string, { fast?: { soft?: AudioBuffer; loud?: AudioBuffer }; slow?: { soft?: AudioBuffer; loud?: AudioBuffer } }> = new Map()

  initIfNeeded() {
    if (!this.audioCtx) {
  const AC = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext
  this.audioCtx = new AC()
  const ctx = this.audioCtx!
  const limiter = ctx.createDynamicsCompressor()
      limiter.threshold.value = -10
      limiter.knee.value = 20
      limiter.ratio.value = 12
      limiter.attack.value = 0.003
      limiter.release.value = 0.25
      this.limiter = limiter
      this.destination = limiter
  limiter.connect(ctx.destination)
    }
  }

  async loadAudioBuffer(url: string): Promise<AudioBuffer> {
    this.initIfNeeded()
    if (!this.audioCtx) throw new Error('AudioContext not initialized')
    if (this.bufferCache.has(url)) return this.bufferCache.get(url) as AudioBuffer
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}`)
    const arrayBuf = await res.arrayBuffer()
    const buffer = await this.audioCtx.decodeAudioData(arrayBuf.slice(0))
    applyDecodeFades(buffer, 20)
    this.bufferCache.set(url, buffer)
    return buffer
  }

  getBaseGainPair(instId: string): GainPair {
    this.initIfNeeded()
    if (!this.audioCtx || !this.destination) throw new Error('Audio not ready')
    const existing = this.baseGains.get(instId)
    if (existing) return existing
    const soft = this.audioCtx.createGain()
    const loud = this.audioCtx.createGain()
    soft.gain.value = 1
    loud.gain.value = 0
    soft.connect(this.destination)
    loud.connect(this.destination)
    const pair = { soft, loud }
    this.baseGains.set(instId, pair)
    return pair
  }

  setBaseGainValues(instId: string, balancePercent: number, muted: boolean) {
    const pair = this.getBaseGainPair(instId)
    if (muted) {
      pair.soft.gain.value = 0
      pair.loud.gain.value = 0
      return
    }
    const bal = Math.max(0, Math.min(100, balancePercent)) / 100
    pair.soft.gain.value = 1 - bal
    pair.loud.gain.value = bal
  }

  createAndStartNode(
    instId: string,
    buffer: AudioBuffer,
    type: 'soft' | 'loud',
    startTime: number,
    offsetSeconds: number,
    fadeMs: number
  ) {
    if (!this.audioCtx) throw new Error('AudioContext not ready')
    const base = this.getBaseGainPair(instId)
    // If an existing node of same type is active, fade it out at startTime to avoid long overlap
    const existing = this.activeNodes.get(instId)
    const existingEntry = existing ? (existing as any)[type] as { src: AudioBufferSourceNode; gain: GainNode } | undefined : undefined
    if (existingEntry) {
      const endTime = startTime + fadeMs / 1000
      existingEntry.gain.gain.cancelScheduledValues(startTime)
      existingEntry.gain.gain.setValueAtTime(existingEntry.gain.gain.value, startTime)
      existingEntry.gain.gain.linearRampToValueAtTime(0, endTime)
      try { existingEntry.src.stop(endTime) } catch {}
    }
    const perGain = this.audioCtx.createGain()
    perGain.gain.setValueAtTime(0, startTime)
    perGain.gain.linearRampToValueAtTime(1, startTime + fadeMs / 1000)
    const src = this.audioCtx.createBufferSource()
    src.buffer = buffer
    if (type === 'soft') perGain.connect(base.soft)
    else perGain.connect(base.loud)
    src.connect(perGain)
    try {
      src.start(startTime, offsetSeconds)
    } catch (e) {
      console.warn('Failed to start source', e)
    }

    const current = this.activeNodes.get(instId) || {}
    ;(current as any)[type] = { src, gain: perGain }
    this.activeNodes.set(instId, current)
    return { src, perGain }
  }

  stopAndCleanupNode(instId: string, type: 'soft' | 'loud', stopTime?: number) {
    const record = this.activeNodes.get(instId)
    if (!record) return
    const entry = (record as any)[type] as { src: AudioBufferSourceNode; gain: GainNode } | undefined
    if (!entry) return
    const t = stopTime ?? this.audioCtx?.currentTime ?? 0
    try {
      entry.src.stop(t)
    } catch {}
    try {
      entry.src.disconnect()
      entry.gain.disconnect()
    } catch {}
    delete (record as any)[type]
    this.activeNodes.set(instId, record)
  }

  fadeAndStopNode(instId: string, type: 'soft' | 'loud', startTime: number, fadeMs: number) {
    const rec = this.activeNodes.get(instId)
    if (!rec) return
    const entry = (rec as any)[type] as { src: AudioBufferSourceNode; gain: GainNode } | undefined
    if (!entry) return
    const endTime = startTime + fadeMs / 1000
    entry.gain.gain.cancelScheduledValues(startTime)
    entry.gain.gain.setValueAtTime(entry.gain.gain.value, startTime)
    entry.gain.gain.linearRampToValueAtTime(0, endTime)
    try { entry.src.stop(endTime) } catch {}
  }

  stopAllActive(fadeMs = 50) {
    if (!this.audioCtx) return
    const now = this.audioCtx.currentTime
    for (const [instId, rec] of this.activeNodes.entries()) {
      const types: Array<'soft' | 'loud'> = ['soft', 'loud']
      for (const t of types) {
        const entry = (rec as any)[t] as { src: AudioBufferSourceNode; gain: GainNode } | undefined
        if (!entry) continue
        entry.gain.gain.cancelScheduledValues(now)
        entry.gain.gain.setValueAtTime(entry.gain.gain.value, now)
        entry.gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000)
        try {
          entry.src.stop(now + fadeMs / 1000)
        } catch {}
      }
    }
    // Clear map after short delay
    setTimeout(() => {
      for (const rec of this.activeNodes.values()) {
        try {
          ;(rec as any).soft?.src.disconnect()
          ;(rec as any).soft?.gain.disconnect()
          ;(rec as any).loud?.src.disconnect()
          ;(rec as any).loud?.gain.disconnect()
        } catch {}
      }
      this.activeNodes.clear()
    }, fadeMs + 10)
  }

  releaseInstance(instId: string) {
    // Stop any active nodes immediately
    this.stopAndCleanupNode(instId, 'soft')
    this.stopAndCleanupNode(instId, 'loud')
    // Disconnect and delete base gains
    const gains = this.baseGains.get(instId)
    if (gains) {
      try { gains.soft.disconnect() } catch {}
      try { gains.loud.disconnect() } catch {}
      this.baseGains.delete(instId)
    }
    // Clear active nodes record
    this.activeNodes.delete(instId)
    // Drop buffers for this instance
    this.buffersByInstTempo.delete(instId)
  }

  async preloadTempoForInstance(
    instId: string,
    partId: string,
    instrumentId: string,
    tempo: Tempo
  ): Promise<void> {
    const softUrl = `/audio/${partId}/${instrumentId}-p-${tempo}.mp3`
    const loudUrl = `/audio/${partId}/${instrumentId}-f-${tempo}.mp3`
    const [soft, loud] = await Promise.all([
      this.loadAudioBuffer(softUrl).catch(() => null),
      this.loadAudioBuffer(loudUrl).catch(() => null)
    ])
    const entry = this.buffersByInstTempo.get(instId) || {}
    ;(entry as any)[tempo] = { soft: soft ?? undefined, loud: loud ?? undefined }
    this.buffersByInstTempo.set(instId, entry)
  }

  getBuffersFor(instId: string, tempo: Tempo): { soft?: AudioBuffer; loud?: AudioBuffer } | undefined {
    const e = this.buffersByInstTempo.get(instId)
    return e ? (e as any)[tempo] : undefined
  }

  getInspectorSnapshot(): AudioInspectorSnapshot {
    return {
      getAudioBuffers: () => {
        // Derive per-inst presence for current tempo isn’t available here; return union presence
        const snap: Record<string, { soft?: boolean; loud?: boolean }> = {}
        for (const [k, v] of this.buffersByInstTempo.entries()) {
          snap[k] = {
            soft: !!(v.fast?.soft || v.slow?.soft),
            loud: !!(v.fast?.loud || v.slow?.loud)
          }
        }
        return snap
      },
      getAudioBuffersByTempo: () => this.getBuffersByInstTempoSnapshot(),
      getNodeStartTimes: () => ({}),
      getDeferredQueue: () => [],
      getPlayState: () => false,
      getParts: () => [],
      scheduledTempoSwitch: null,
      getTransportStartTime: () => null,
  getTempo: () => 'slow'
    }
  }

  getBuffersByInstTempoSnapshot(): Record<string, { fast?: { soft?: boolean; loud?: boolean }; slow?: { soft?: boolean; loud?: boolean } }> {
    const out: Record<string, any> = {}
    for (const [k, v] of this.buffersByInstTempo.entries()) {
      out[k] = {
        fast: { soft: !!v.fast?.soft, loud: !!v.fast?.loud },
        slow: { soft: !!v.slow?.soft, loud: !!v.slow?.loud }
      }
    }
    return out
  }
}

export const audioService = new AudioService()
