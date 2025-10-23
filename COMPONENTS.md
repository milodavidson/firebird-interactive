# Component & Architecture Reference

This document provides a component-by-component breakdown to help a new engineer quickly understand responsibilities, inputs/outputs, and where to look for tests.

If you need a higher-level overview, see `README.md`.

## Core audio modules

- `src/lib/audio/AudioService.ts`
  - Responsibility: low-level Web Audio API wrapper.
  - Key behaviors: initialize AudioContext, manage master/limiter gain, cache decoded AudioBuffers, create/fade/stop AudioBufferSourceNodes per instance, and expose an inspector snapshot.
  - Important methods: `loadAudioBuffer(url)`, `preloadTempoForInstance(instId, partId, instrumentId, tempo)`, `createAndStartNode(...)`, `fadeAndStopNode(...)`, `stopAllActive()`, `getInspectorSnapshot()`.
  - Tests: `tests/unit/audioService.spec.ts` covers buffer caching and node lifecycle behavior.

- `src/lib/audio/AudioScheduler.ts`
  - Responsibility: transport grid, loop scheduling, deferred queue processing, and tempo switching.
  - Key behaviors: compute next loop/beat boundaries, schedule start/stop of nodes at precise AudioContext times, process deferred queue items at loop boundaries, and anchor tempo switches so the perceived beat continues across tempos.
  - Important interactions: uses helpers in `audioUtils`, consults `usePartsStore` refs, and calls `AudioService` to create nodes.
  - Tests: `tests/unit/scheduler.spec.ts` and E2E tempo-switch tests.

- `src/lib/audio/audioUtils.ts`
  - Responsibility: beat math and time conversions.
  - Typical helpers: seconds per beat, beats per loop, computeTargetOffsetForBeat, computeNextBeatScheduleTime, computeWithinLoopBeatAtTime.
  - Tests: unit tests in `tests/unit` (offsetMapping.spec, queueBoundary.spec).

## Hooks and store

- `src/hooks/usePartsStore.ts`
  - Responsibility: global app state using Zustand — parts, assigned instruments, tempo, play state, and paired mutable refs used at runtime by the scheduler.
  - IMPORTANT: setters like `setParts`, `setPlay`, `setTempo` must be used to keep the `.Ref.current` mirror values in sync with UI state. The scheduler and AudioService read `.Ref.current` directly for low-latency decisions.

- `src/hooks/useAssignments.ts`
  - Responsibility: UI flows to add/remove instruments, mark `isLoading` for queued instruments, and push items to the deferred queue when playing.
  - Interacts with: `AudioService.preloadTempoForInstance` when idle or to preload current tempo when playing.

- `src/hooks/useAudioInspector.ts`
  - Responsibility: attach a richer `window.__audioInspector` object used by Playwright tests. The inspector wraps `AudioService.getInspectorSnapshot()` and scheduler/store state to provide test-friendly getters.

## UI components (where to look)

The UI is under `src/app/` (Next.js app router) and `src/components/`.

- `src/components/AssignedInstrument.tsx` — per-instance UI (mute/status/progress). Shows loading/queued state.
- `src/components/PlayerControls.tsx` — play/pause, tempo select, master volume controls.
- `src/components/InstrumentList.tsx` — list of available instruments by part; UI to add instruments.
- `src/components/PartsGrid.tsx` and `PartCard.tsx` — layout and per-part controls.

For each UI component, tests and visual behavior are covered partly by E2E tests in `tests/e2e/` and unit snapshots (if present).

## Public assets and scripts

- `public/audio/` — audio files grouped by part. Files should follow `{instrument}-{p|f}-{tempo}.mp3`.
- `scripts/check-audio-files.js` — verifies presence (and optionally durations via ffprobe) of expected audio files.

## Inspector API (summary)

The Playwright tests expect an inspector API attached at `window.__audioInspector`. Typical methods and properties (may be implemented across `AudioService` and inspector hook):

- `getParts()` — current parts snapshot and assigned instruments
- `getAudioBuffers()` / `getAudioBuffersByTempo()` — buffer cache presence
- `getNodeStartTimes()` — recorded start times for created nodes
- `getWithinBeatAtTime(time)` / `getWithinBeatAtTimeForTempo(time, tempo)` — helper to compute within-loop beat at an arbitrary time
- `scheduledTempoSwitch` — the scheduled tempo switch preview object
- `getLastTempoSwitchExecution()` — last executed switch info
- `getTempo()` / `getSecondsPerBeatForTempo()` / `getBeatsPerLoop()` — runtime tempo helpers

If you change inspector shape, update tests in `tests/e2e/` accordingly.

## How a queued instrument becomes audible (trace)

1. User clicks to add an instrument via `InstrumentList`/`useAssignments`.
2. If the app is idle, `AudioService.preloadTempoForInstance` is called and `isLoading` cleared when buffers ready.
3. If the app is playing, the assignment is added to a deferred queue and `isLoading` is set. The scheduler will process the deferred queue at the next loop boundary.
4. At the loop boundary, `AudioScheduler.processDeferredQueueAtBeat` calls `AudioService.preloadTempoForInstance`, computes offsets with `audioUtils.computeTargetOffsetForBeat`, and calls `AudioService.createAndStartNode` to start nodes at an anchored schedule time.
5. `nodeStartTimesRef` records start times for debugging and tests.

## Where tests live

- Unit: `tests/unit/` — timing helpers, audio service unit tests, scheduler math.
- E2E: `tests/e2e/` — Playwright tests that exercise queueing, removal during playback, and tempo switches. These tests rely on `window.__audioInspector`.

## Add/change guidance

- When changing scheduling math, add unit tests for `audioUtils` before modifying `AudioScheduler` behavior. Small math regressions are best caught in unit tests.
- When changing `usePartsStore`, ensure setter helpers keep `.Ref.current` in sync.
- When adding/renaming audio files, update `scripts/check-audio-files.js` and run `npm run check-audio`.

---

If you'd like, I can expand this file further into a full architecture doc with sequence diagrams and example code snippets.
