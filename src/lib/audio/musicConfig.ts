export const musicConfig = {
  // Number of beats in one loop (same for both tempos)
  beatsPerLoop: 28,
  // BPM values for the two tempo variants. Fast should be ~2x slow.
  bpms: {
    fast: 160,
    slow: 80
  }
}

export type MusicConfig = typeof musicConfig
