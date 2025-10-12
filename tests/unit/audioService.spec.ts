import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AudioService } from '@/lib/audio/AudioService'

class MockAudioBuffer {
  numberOfChannels = 1
  sampleRate: number
  private channels: Float32Array[]
  duration: number
  constructor(chans: number, length: number, sampleRate: number) {
    this.numberOfChannels = chans
    this.sampleRate = sampleRate
    this.channels = Array.from({ length: chans }, () => new Float32Array(length))
    this.duration = length / sampleRate
  }
  getChannelData(ch: number) {
    return this.channels[ch]
  }
}

class MockParam { value = 0 }
class MockDynamics {
  threshold = new MockParam()
  knee = new MockParam()
  ratio = new MockParam()
  attack = new MockParam()
  release = new MockParam()
  connect() {}
}
class MockGain {
  gain = { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} }
  connect() {}
  disconnect() {}
}
class MockBufferSource {
  buffer: any
  connect() {}
  start() {}
  stop() {}
  disconnect() {}
}

class MockAudioContext {
  sampleRate = 44100
  destination = {}
  state: 'suspended' | 'running' = 'running'
  currentTime = 0
  createBuffer(chans: number, length: number, sampleRate: number) {
    return new MockAudioBuffer(chans, length, sampleRate) as any
  }
  createDynamicsCompressor() {
    return new MockDynamics() as any
  }
  createGain() {
    return new MockGain() as any
  }
  createBufferSource() {
    return new MockBufferSource() as any
  }
  async decodeAudioData(_arr: ArrayBuffer) {
    const length = this.sampleRate * 1
    const buf = new MockAudioBuffer(1, length, this.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return buf as any
  }
  resume() { this.state = 'running'; return Promise.resolve() }
}

describe('AudioService.loadAudioBuffer', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }))
    // @ts-ignore
    global.AudioContext = MockAudioContext as any
  })

  it('decodes and applies fades', async () => {
    const svc = new AudioService()
    svc.initIfNeeded()
    const buf = await svc.loadAudioBuffer('/audio/test.mp3')
    expect(buf).toBeTruthy()
    // basic sanity on fades: edges likely close to zero after fade
    const data = buf.getChannelData(0)
    expect(Math.abs(data[0])).toBeLessThan(0.5)
    expect(Math.abs(data[data.length - 1])).toBeLessThan(0.5)
  })
})
