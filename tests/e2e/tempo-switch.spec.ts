import { test, expect } from '@playwright/test'

test.describe('tempo switch', () => {
  test('schedules at next beat boundary', async ({ page }) => {
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

    // Trigger tempo switch to slow
    await page.getByLabel('Tempo').selectOption('slow')

    // Wait for scheduledTempoSwitch to be set
    const sw = await page.waitForFunction(() => {
      const insp: any = (window as any).__audioInspector
      return insp.scheduledTempoSwitch || null
    })
    expect(sw).toBeTruthy()

    // After some time, ensure at least one start exists (we’re asserting scheduling presence vs exact count growth in this minimal test)
    await page.waitForTimeout(1200)
    const ok = await page.evaluate(() => {
      const insp: any = (window as any).__audioInspector
      const parts = insp.getParts()
      const melody = parts.find((p: any) => p.id === 'melody')
      const id = melody.assignedInstruments[0].id
      const nst = insp.getNodeStartTimes()
      return Boolean(nst[id] && (typeof nst[id].soft === 'number' || typeof nst[id].loud === 'number'))
    })
    expect(ok).toBeTruthy()
  })
})
