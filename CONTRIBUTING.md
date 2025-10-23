# Contributing & Developer Checklist

This file contains practical guidance for getting the project running locally, running tests, debugging Playwright flows, and using the audio inspector for troubleshooting.

## Recommended Node version

Install Node 18 (LTS). The project includes a `.nvmrc` with the recommended major version; use `nvm use` if you have nvm installed.

## Setup

```bash
npm install
# Install Playwright browsers (only needed if you run e2e locally)
npm run playwright:install
```

## Run the app

```bash
npm run dev
```

Visit http://localhost:3000

## Unit tests (Vitest)

```bash
npm run test:unit
# Watch mode while developing
npm run test:unit:watch
```

## Playwright E2E tests

Install browsers (if not already):

```bash
npm run playwright:install
```

Run tests:

```bash
npm run test:e2e
```

Debugging Playwright locally

- To run tests in headed mode, edit `playwright.config.ts` to set `use: { headless: false }` or run Playwright with the `DEBUG=pw:api` env as needed.
- Playwright starts the dev server as configured in `playwright.config.ts`. Make sure the dev server port matches the config.

## Using the audio inspector (manual debugging)

Open the browser console while running the app and evaluate `window.__audioInspector`. Example helper calls used by tests:

- `__audioInspector.getParts()` — parts and assigned instruments snapshot
- `__audioInspector.getNodeStartTimes()` — recorded start times for nodes
- `__audioInspector.getWithinBeatAtTime(t)` — compute the within-loop beat at a specific AudioContext time
- `__audioInspector.scheduledTempoSwitch` — preview of a scheduled tempo switch

Example: sample within-beat in the console

```js
const insp = window.__audioInspector
console.log('current tempo', insp.getTempo())
console.log('within at now', insp.getWithinBeatAtTime(performance.now() / 1000))
```

Note: the inspector wraps AudioService and scheduler state. If you change inspector method names, update `tests/e2e/` accordingly.

## Audio assets and check script

- Audio files live under `public/audio/{part}/` and must follow `{instrument}-{p|f}-{tempo}.mp3` (e.g., `brass-p-fast.mp3`).
- Use `npm run check-audio` to validate presence. The script optionally uses `ffprobe` (if installed) to validate durations.

When adding instruments or parts, update `scripts/check-audio-files.js` so CI and contributors can validate assets.

## PR checklist

- Add/update unit tests for changes in `audioUtils` or scheduling behavior.
- If adding new audio assets, run `npm run check-audio` and include any new files in the PR.
- If you change the inspector, update E2E tests in `tests/e2e/`.

## Troubleshooting

- No inspector in browser: verify the app has fully mounted and the audio system initialised. The inspector is attached during app init.
- Playwright timeouts: run tests in headed mode and inspect console logs. Playwright logs often include inspector outputs.

If you want, I can add a short `DEVELOPMENT.md` showing an end-to-end developer workflow for adding an instrument and asserting node starts with the inspector.
