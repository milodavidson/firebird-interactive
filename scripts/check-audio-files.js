const fs = require('fs')
const path = require('path')

const parts = ['melody', 'harmony', 'rhythm', 'texture']
const instruments = ['brass', 'strings', 'woodwind', 'percussion']
const dynamics = ['p', 'f']
const tempos = ['fast', 'slow']

const missing = []
for (const part of parts) {
  for (const inst of instruments) {
    for (const dyn of dynamics) {
      for (const tempo of tempos) {
        const rel = path.join('public', 'audio', part, `${inst}-${dyn}-${tempo}.mp3`)
        if (!fs.existsSync(rel)) missing.push(rel)
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
