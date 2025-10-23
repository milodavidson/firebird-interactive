# Firebird Interactive — Interactive Listening Map

A beat-scheduled, looped interactive listening map. The app lets listeners combine four musical parts (melody, harmony, rhythm, texture) and add instruments per-part, switch tempo, and queue additions in time with the transport. Audio files are pre-rendered MP3s in `public/audio` and scheduling is driven by a deterministic transport so loops and tempo switches stay aligned.

This README is written to help a new engineer understand, run, and develop the product.

## Quick start

Prerequisites

- Node.js (18+ recommended)
- npm (or use pnpm/yarn but scripts assume npm)

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser (Next.js default).

Important scripts (see `package.json`)

- `npm run dev` — start Next.js in development mode
- `npm run build` — build for production
- `npm run start` — start built Next.js app
- `npm run test:unit` — run unit tests (Vitest)
- `npm run test:e2e` — run Playwright E2E tests (install browsers first)
- `npm run playwright:install` — install Playwright browsers and deps
- `npm run check-audio` — validate required audio files exist

## Project structure (high level)

Key folders and files:

- `src/lib/audio/AudioService.ts` — low-level Web Audio wrapper. Handles buffer caching, creating nodes, fades, per-instance gain routing, and an inspector snapshot API used by tests.
- `src/lib/audio/AudioScheduler.ts` — transport and scheduling logic. Aligns loops, handles tempo switches, defers queue processing, and anchors tempo switches to beat boundaries.
- `src/lib/audio/audioUtils.ts` — timing and beat math helpers (durations, offsets, next-beat computation).
- `src/hooks/usePartsStore.ts` — global UI state (Zustand) and the mutable ref mirrors required by the scheduler (`partsRef`, `playStateRef`, `transportStartRef`). Use the provided setters (`setParts`, `setPlay`, `setTempo`) to keep refs in sync.
- `src/hooks/useAssignments.ts` — UI flow for adding/removing instruments, handling preloads vs deferred queue items.
- `public/audio/` — audio assets organized by part and instrument.
- `tests/unit/` — unit tests for scheduling and utils
- `tests/e2e/` — Playwright end-to-end tests (they rely on `window.__audioInspector`)

The app UI is in `src/app/` components and pages (Next 14 app router).

## Runtime contract (short)

Inputs

- UI actions: add/remove instrument, play/pause, tempo switch, mute/solo
- Audio assets: MP3 files under `public/audio/{part}/{instrument}-{p|f}-{tempo}.mp3`

Outputs and side-effects

- Audio nodes created/stopped via `AudioService`
- Updates to the `usePartsStore` state (flags like `isLoading`, `queueScheduleTime`)
- A read-only audio inspector exposed at `window.__audioInspector` for tests and debugging

Error modes

- Missing audio files: `AssignedInstrument.hasError` is set and visible to UI/tests
- If buffers fail to decode, errors propagate to `AudioService` and set per-instance error flags

## Audio assets layout and naming convention

Audio files must live under `public/audio/{part}/` where `{part}` is one of: `melody`, `harmony`, `rhythm`, `texture`.

Filename convention (required):

{instrument}-{dynamics}-{tempo}.mp3

- instrument — short instrument id (e.g., `brass`, `strings`, `kick`)
- dynamics — `p` (soft) or `f` (loud)
- tempo — `slow` or `fast`

Examples

- `public/audio/melody/brass-p-fast.mp3`
- `public/audio/rhythm/kick-f-slow.mp3`

Use `npm run check-audio` to validate the presence of required files. If you add or rename instruments or parts, update `scripts/check-audio-files.js` accordingly.

## Key design notes and conventions

- Mutable refs in `usePartsStore` mirror reactive state for runtime scheduling. Always call setter helpers (`setParts`, `setPlay`, `setTempo`) when updating store state so the `.Ref.current` mirrors remain consistent with UI state.
- Instance IDs are generated as `${partId}-${instrumentId}-${Date.now()}` and are used as the life-cycle key for audio nodes and inspector traces.
- Two variants per instrument: soft (`-p-`) and loud (`-f-`) files. The scheduler and service treat both but route them through a per-instance GainPair.
- Preloading strategy: when idle the app preloads both tempos for added instruments; when playing it preloads the current tempo immediately and the other tempo in background. Scheduling relies on buffers being present for the tempo being used.
- Tempo switches are anchored to the transport grid: `AudioScheduler.scheduleTempoSwitch` preloads target tempo, computes next beat boundaries, and creates new nodes at a computed offset so perceived continuity is preserved. Avoid changing `currentTempoRef` directly while playing.

## Testing

Unit tests

- Unit tests use Vitest. Run `npm run test:unit`.
- Good starting points for adding tests: helpers in `src/lib/audio/audioUtils.ts` (beat math), and `AudioService` behaviors (buffer caching, node lifecycle).

E2E tests (Playwright)

- Playwright tests live in `tests/e2e/` and depend on the audio inspector exposed on `window.__audioInspector`.
- Before running E2E: `npm run playwright:install` to ensure browsers are installed.
- Run tests: `npm run test:e2e`.
- Playwright's tests start a local dev server as configured in `playwright.config.ts` — check that file if you need to change the dev server command or port.

Inspector API (used by tests)

The app exposes a read-only inspector at `window.__audioInspector` with helpers used by tests. Typical API surface (read-only getters):

- `getParts()` — returns a snapshot of parts and assigned instruments
- `getNodeStartTimes()` — returns recorded start times for nodes created
- `getBuffers()` — returns cached buffer keys and load states

If you change the inspector shape, update tests under `tests/e2e/` accordingly.

## Development notes & where to start

If you're new to the codebase and want to make improvements, here's a recommended path:

1. Run the app locally and interact with the UI. Add/remove instruments and watch the inspector in the browser console: `__audioInspector.getParts()`.
2. Run unit tests and open failing test output to reproduce logic errors quickly.
3. Inspect `src/lib/audio/audioUtils.ts` for beat math helpers and add unit tests for any new logic.
4. When modifying runtime scheduling (in `AudioScheduler`), update unit tests and run E2E tests — they assert behavior via the inspector.

Small, safe improvements to add proactively

- Add unit tests for `audioUtils` helpers if missing (easy and valuable)
- Expand `scripts/check-audio-files.js` to print missing files with remediation hints
- Add a small CONTRIBUTING.md or dev checklist for interactive debugging with `__audioInspector` and Playwright troubleshooting tips

## Troubleshooting

- No audio: check that `public/audio/...` files exist and `npm run check-audio` passes.
- Timing/offset issues: inspect `__audioInspector.getNodeStartTimes()` to see node start times and compare against expected transport times.
- Playwright tests failing due to missing inspector: ensure `window.__audioInspector` is attached early in app initialization (check `AudioService` and app entrypoints).

## File map — where to look for common features

- Add/remove instrument flow: `src/hooks/useAssignments.ts`
- Store state and mutable refs: `src/hooks/usePartsStore.ts`
- Low-level audio ops and inspector: `src/lib/audio/AudioService.ts`
- Scheduling and tempo switch logic: `src/lib/audio/AudioScheduler.ts`
- Timing helpers: `src/lib/audio/audioUtils.ts`
- Tests: `tests/unit/` and `tests/e2e/`

## Contact & notes

If you need more context, the author has left internal notes in `.github/copilot-instructions.md` describing architecture and testing expectations — read that file for a compact developer guide.

Thanks for taking this on — the scheduling and inspector APIs make the project testable and maintainable; follow the ref mirror conventions in `usePartsStore` and add unit tests for any scheduling math you change.

Further documentation

- Component and architecture reference: `COMPONENTS.md` — a file-by-file breakdown and responsibilities map for core modules, hooks, and UI components.
- Contributor/dev checklist: `CONTRIBUTING.md` — setup commands, Playwright tips, inspector usage examples, and audio asset guidance.
- Node version: see `.nvmrc` for the recommended Node major version used for development.
# Interactive Listening Map (WIP)

This project implements a beat-scheduled interactive listening map with four parts and tempo switching.

Quick start:

- Install deps: `npm install`
- Dev: `npm run dev`
- Unit tests: `npm run test:unit`
- E2E (Playwright): `npm run playwright:install` then `npm run test:e2e`
- Check audio files: `npm run check-audio`

Place audio samples in `public/audio/{part}/{instrument}-{p|f}-{tempo}.mp3`.
If `public/` doesn't exist, create it. The expected tree is:

public/
	audio/
		melody/
			brass-p-fast.mp3
			brass-f-fast.mp3
			brass-p-slow.mp3
			brass-f-slow.mp3
			strings-...
			woodwind-...
			percussion-...
		harmony/ (same pattern)
		rhythm/ (same pattern)
		texture/ (same pattern)

Inspector: the app exposes `window.__audioInspector` with read-only getters for tests.

> Note: This is an initial scaffold; remaining work includes full queued progress visuals, mute/solo/volume, and final E2E tests.