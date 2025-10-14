## Firebird Interactive — AI coding agent instructions

Short, actionable guidance to help code agents be immediately productive in this repo.

- Project purpose: a beat-scheduled, looped interactive listening map with four parts (melody, harmony, rhythm, texture). Audio is played from pre-rendered MP3 files under `public/audio/{part}/{instrument}-{p|f}-{tempo}.mp3`.

- Start here to understand architecture:
  - `src/lib/audio/AudioService.ts` — low-level Web Audio wrapper: buffer caching, creating nodes, fades, base gain routing, and an inspector snapshot API. Many tests and UI interactions call into this behaviour.
  - `src/lib/audio/AudioScheduler.ts` — scheduling logic: aligns loops and tempo switches to a transport grid, manages deferred queue processing and tempo switch anchoring. Crucial for timing correctness.
  - `src/hooks/usePartsStore.ts` — global UI state (Zustand) and the mutable ref mirrors used by the scheduler: `partsRef`, `playStateRef`, `transportStartRef`, etc. Mutating the store must keep ref mirrors in sync (see `setParts`, `setPlay`, `setTempo`).
  - `src/hooks/useAssignments.ts` — how UI adds/removes instruments and how queued additions are handled (preload vs deferred queue while playing).
  - `src/lib/audio/audioUtils.ts` — (read for beat/loop math). Many scheduling decisions call helpers here (beatsPerLoop, computeNextBeatScheduleTime, computeTargetOffsetForBeat).

- Important runtime contract (small contract):
  - Inputs: UI actions (add/remove instruments, play/pause, tempo switch). Audio files live at `public/audio/...`.
  - Outputs: scheduling side-effects via `AudioService` (nodes created/stopped), updates to `usePartsStore` parts (isLoading, queueScheduleTime), and `window.__audioInspector` for tests.
  - Error modes: missing audio files set `hasError` on AssignedInstrument and tests assert presence/absence via inspector.

- Developer workflows / commands (source: `package.json` / `README.md`):
  - Install: `npm install`
  - Dev server: `npm run dev` (Next.js)
  - Unit tests: `npm run test:unit` (Vitest)
  - E2E: `npm run playwright:install` then `npm run test:e2e` (Playwright). Playwright runs a local webserver (`npm run dev`) per `playwright.config.ts`.
  - Check audio files: `npm run check-audio` (script at `scripts/check-audio-files.js`).

- Project-specific conventions and patterns:
  - Mutable refs in `usePartsStore` mirror reactive state for runtime audio scheduling. When updating store state use the provided setters (`setParts`, `setPlay`, `setTempo`) so the corresponding `.Ref.current` mirrors stay consistent.
  - Instance IDs for assigned instruments are generated as `${partId}-${instrumentId}-${Date.now()}` and are the unit of audio lifecycle management (AudioService maps buffers / nodes / cleanup by instance id).
  - Two audio variants per instrument: soft (`-p-`) and loud (`-f-`) files. The scheduler and service treat them separately but route both through a per-instance GainPair.
  - Preloading strategy: when idle the app preloads both tempos; when playing it preloads current tempo immediately and other tempo in background. Scheduling relies on buffers being present for a given tempo.
  - Tempo switching is anchored to the transport grid: `AudioScheduler.scheduleTempoSwitch` preloads target tempo, computes next beat boundaries, and creates new nodes at a computed offset so perceived continuity is preserved. Avoid changing `currentTempoRef` directly while playing.
  - The audio inspector is exposed at `window.__audioInspector` (read-only getters). E2E tests depend on it heavily. When changing inspector shape, update tests in `tests/e2e`.

- Testing and debugging tips:
  - E2E tests wait for `window.__audioInspector` to exist. If you change how the inspector is exposed, update tests.
  - To reproduce flaky timing locally, open the browser and use the inspector API from the dev console (e.g. `__audioInspector.getNodeStartTimes()`, `getParts()`).
  - Playwright runs headless by default. Use `playwright.config.ts` to set `headless: false` for interactive debugging.

- Cross-file examples (use these as anchors for changes):
  - Queueing flow: `src/hooks/useAssignments.ts` -> `audioService.preloadTempoForInstance` -> `AudioScheduler.processDeferredQueueAtBeat` -> `audioService.createAndStartNode`.
  - Tempo switch: UI triggers `AudioScheduler.scheduleTempoSwitch` -> preloads (AudioService) -> computes `withinBeatUsed` -> fades old nodes and `createAndStartNode` for new tempo -> re-anchors `transportStartRef`.

- When modifying scheduling/timing code:
  - Add unit tests in `tests/unit` that assert math helpers in `audioUtils.ts` first. Those are cheap and validate timing logic.
  - For any behavioral change in `AudioScheduler`, update E2E tests under `tests/e2e` and verify the inspector outputs unchanged shapes.

- When adding or renaming files under `public/audio`, update `README.md` and `scripts/check-audio-files.js` expectations.

- Quick file map (important files):
  - `src/lib/audio/AudioService.ts` — core audio operations + inspector snapshot
  - `src/lib/audio/AudioScheduler.ts` — tempo/loop scheduling logic
  - `src/lib/audio/audioUtils.ts` — math helpers (beats, offsets, durations)
  - `src/hooks/usePartsStore.ts` — global store and mutable refs
  - `src/hooks/useAssignments.ts` — add/remove instrument flow
  - `public/audio/` — audio assets (required for playback/e2e)
  - `tests/e2e/*.spec.ts` — Playwright tests that rely on `window.__audioInspector`

If anything in this file is unclear or you want more examples (e.g., typical unit tests to add, inspector shape details, or a small dev checklist), tell me what you want clarified and I will iterate. 
