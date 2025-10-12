import { test, expect } from '@playwright/test'

test.describe('removal during playback', () => {
  test('removing an instrument stops scheduling', async ({ page }) => {
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

    // Click remove button
    await page.getByRole('button', { name: /Remove/i }).click()

    // Capture current nodeStart count
    const before = await page.evaluate(() => {
      const insp: any = (window as any).__audioInspector
      const parts = insp.getParts()
      const melody = parts.find((p: any) => p.id === 'melody')
      if (!melody) return 0
      const inst = melody.assignedInstruments[0]
      if (!inst) return 0
      const nst = insp.getNodeStartTimes()[inst.id] || {}
      return Number(Boolean(nst.soft)) + Number(Boolean(nst.loud))
    })

    // Wait a while and confirm count did not increase
    await page.waitForTimeout(1500)
    const after = await page.evaluate(() => {
      const insp: any = (window as any).__audioInspector
      const parts = insp.getParts()
      const melody = parts.find((p: any) => p.id === 'melody')
      const inst = melody?.assignedInstruments[0]
      if (!inst) return 0
      const nst = insp.getNodeStartTimes()[inst.id] || {}
      return Number(Boolean(nst.soft)) + Number(Boolean(nst.loud))
    })

    expect(after).toBeLessThanOrEqual(before)
  })
})
