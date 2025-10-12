import { test, expect } from '@playwright/test'

test.describe('queueing', () => {
  test('adding during playback queues and starts at next beat', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof (window as any).__audioInspector !== 'undefined')

    // Start playback
    await page.getByRole('button', { name: 'Play' }).click()

  // Drag/tap add melody:brass via clicks (tap-select + tap-part)
    await page.getByRole('button', { name: 'Brass' }).first().click()
    await page.getByTestId('part-melody').click()

    // Wait shortly for it to appear queued
    const hadQueue = await page.waitForFunction(() => {
      const insp: any = (window as any).__audioInspector
      const parts = insp.getParts()
      const melody = parts.find((p: any) => p.id === 'melody')
      return Boolean(melody?.assignedInstruments.some((ai: any) => ai.isLoading))
    })
    expect(hadQueue).toBeTruthy()

    // Capture scheduleTime and then verify node starts shortly after
    const info = await page.evaluate(() => {
      const insp: any = (window as any).__audioInspector
      const parts = insp.getParts()
      const melody = parts.find((p: any) => p.id === 'melody')
      const inst = melody.assignedInstruments[0]
      return { id: inst.id, scheduleTime: inst.queueScheduleTime, transport: insp.getTransportStartTime() }
    })

    // Wait up to 5 seconds for nodeStartTimes to include this id (scalar last times)
    await page.waitForFunction(({ id }) => {
      const insp: any = (window as any).__audioInspector
      const nst = insp.getNodeStartTimes()
      return nst[id] && (typeof nst[id].soft === 'number' || typeof nst[id].loud === 'number')
    }, info, { timeout: 5000 })

    const starts = await page.evaluate(({ id }) => {
      const insp: any = (window as any).__audioInspector
      const nst = insp.getNodeStartTimes()
      return nst[id]
    }, info)

    const allTimes = [starts.soft, starts.loud].filter((v) => typeof v === 'number') as number[]
    expect(allTimes.length).toBeGreaterThan(0)
    const minStart = Math.min(...allTimes)
    // within ~30ms of scheduled time is acceptable in CI
    expect(Math.abs(minStart - info.scheduleTime)).toBeLessThan(0.05)
  })
})
