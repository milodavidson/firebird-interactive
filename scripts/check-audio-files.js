const fs = require('fs')
const path = require('path')

const parts = ['melody', 'harmony', 'rhythm', 'texture']
const instruments = ['brass', 'strings', 'woodwind', 'percussion']
const dynamics = ['p', 'f']
const tempos = ['fast', 'slow']

// Optional duration validation: if ffprobe is present, we will compare decoded
// durations against expected loop durations computed from musicConfig.
let doDurationCheck = false
try {
  const { spawnSync } = require('child_process')
  const r = spawnSync('ffprobe', ['-version'])
  if (r.status === 0) doDurationCheck = true
} catch (e) {
  doDurationCheck = false
}

// Lazy load musicConfig to compute expected durations when validating
let musicConfig
if (doDurationCheck) {
  try {
    musicConfig = require('../src/lib/audio/musicConfig').musicConfig
  } catch (e) {
    doDurationCheck = false
  }
}

const missing = []
for (const part of parts) {
  for (const inst of instruments) {
    for (const dyn of dynamics) {
      for (const tempo of tempos) {
        const rel = path.join('public', 'audio', part, `${inst}-${dyn}-${tempo}.mp3`)
        if (!fs.existsSync(rel)) missing.push(rel)
        else if (doDurationCheck && musicConfig) {
          // run ffprobe to get duration in seconds
          const { spawnSync } = require('child_process')
          const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', rel])
          if (r.status === 0) {
            const out = (r.stdout || '').toString().trim()
            const dur = Number(out)
            const expected = musicConfig.beatsPerLoop * (60 / musicConfig.bpms[tempo])
            const diff = Math.abs(dur - expected)
            // tolerance 0.1s
            if (diff > 0.1) {
              console.log(`Duration mismatch for ${rel}: got ${dur}s expected ${expected}s (diff ${diff}s)`)
              missing.push(rel + ' (duration mismatch)')
            }
          }
        }
      }
    }
  }
}

if (missing.length) {
  console.log('Missing audio files:')
  for (const m of missing) console.log(' -', m)
  process.exit(1)
} else {
  console.log('All expected audio files are present (placeholder list).')
}
