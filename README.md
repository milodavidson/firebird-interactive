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