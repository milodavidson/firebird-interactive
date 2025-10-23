import { test, expect } from '@playwright/test'

test.describe('tempo switch', () => {
  test('schedules at next beat boundary and same beat number across tempos (twice)', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => typeof (window as any).__audioInspector !== 'undefined')
    // Add one instrument while paused
    await page.getByRole('button', { name: 'Brass' }).first().click()
    await page.getByTestId('part-melody').click()

    // Start playback
    await page.getByRole('button', { name: 'Play' }).click()

    // Wait until at least one nodeStart recorded
    await page.waitForFunction(() => {
      const insp: any = (window as any).__audioInspector
      const parts = insp.getParts()
      const melody = parts.find((p: any) => p.id === 'melody')
      const id = melody?.assignedInstruments[0]?.id
      if (!id) return false
      const nst = insp.getNodeStartTimes()
      return nst[id] && (typeof nst[id].soft === 'number' || typeof nst[id].loud === 'number')
    })

    // Sample current within-loop beat and next beat before switch
    const pre = await page.evaluate(() => {
      const insp: any = (window as any).__audioInspector
      return { within: insp.getWithinBeat1(), nextWithin: insp.getNextWithinBeat1() }
    })
    expect(typeof pre.within).toBe('number')
    expect(typeof pre.nextWithin).toBe('number')

    // Trigger tempo switch to slow
    await page.getByLabel('Tempo').selectOption('slow')
    // Wait for the scheduler to record the switch execution
    const sw1 = await page.waitForFunction(() => {
      const insp: any = (window as any).__audioInspector
      const s = insp.scheduledTempoSwitch
      return s && s.scheduleTime ? s : null
    })
    const sw1Data: any = await sw1.jsonValue()
    // Wait for execution to complete (anchor applied)
    await page.waitForFunction((scheduledTime) => {
      const insp: any = (window as any).__audioInspector
      const exec = insp.getLastTempoSwitchExecution && insp.getLastTempoSwitchExecution()
      return exec && Math.abs(exec.scheduleTime - scheduledTime) < 1e-3
    }, sw1Data.scheduleTime)
    // Evaluate within-beat exactly at the switch execution moment (plus a tiny epsilon) on target tempo
    const beatAtSwitch1 = await page.evaluate((t: number) => {
      const insp: any = (window as any).__audioInspector
      return insp.getWithinBeatAtTimeForTempo(t + 0.005, 'slow')
    }, sw1Data.scheduleTime)
  expect(beatAtSwitch1).toBe(sw1Data.withinBeatTargetCorrected ?? sw1Data.withinBeatTarget)

  // Also verify the next loop restart aligns to a loop boundary on the new grid
    // Find a time just after the next loop boundary (on new grid) and ensure within-beat is 1
    const ok = await page.evaluate(async () => {
      const insp: any = (window as any).__audioInspector
      const sw = insp.getLastTempoSwitchExecution()
      if (!sw) return false
      // compute boundary based on withinBeatUsed at execution using runtime helpers
      const tempo = insp.getTempo()
      const spb = insp.getSecondsPerBeatForTempo(tempo)
      const bpl = insp.getBeatsPerLoop()
      const remainingBeats = bpl - (sw.withinBeatUsed - 1)
      const boundary = sw.scheduleTime + remainingBeats * spb
      // sample slightly after boundary
      const sampleTime = boundary + 0.05
      const beatAt = insp.getWithinBeatAtTime(sampleTime)
      return beatAt === 1
    })
    expect(ok).toBeTruthy()

    // Perform a second switch back to fast and assert beat mapping again
    const pre2 = await page.evaluate(() => {
      const insp: any = (window as any).__audioInspector
      return { within: insp.getWithinBeat1(), nextWithin: insp.getNextWithinBeat1() }
    })
    await page.getByLabel('Tempo').selectOption('fast')
    const sw2 = await page.waitForFunction(() => {
      const insp: any = (window as any).__audioInspector
      const s = insp.scheduledTempoSwitch
      return s && s.scheduleTime ? s : null
    })
    const sw2Data: any = await sw2.jsonValue()
    await page.waitForFunction((scheduledTime) => {
      const insp: any = (window as any).__audioInspector
      const exec = insp.getLastTempoSwitchExecution && insp.getLastTempoSwitchExecution()
      return exec && Math.abs(exec.scheduleTime - scheduledTime) < 1e-3
    }, sw2Data.scheduleTime)
    const beatAtSwitch2 = await page.evaluate((t: number) => {
      const insp: any = (window as any).__audioInspector
      return insp.getWithinBeatAtTimeForTempo(t + 0.005, 'fast')
    }, sw2Data.scheduleTime)
  expect(beatAtSwitch2).toBe(sw2Data.withinBeatTargetCorrected ?? sw2Data.withinBeatTarget)
  })
})
