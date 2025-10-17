import { test, expect } from '@playwright/test'

// Simple helper to inject axe-core from CDN and run an analysis
async function runAxe(page: any) {
  // Try to load axe from local node_modules first (faster and works offline in CI if installed)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const p = require.resolve('axe-core/axe.min.js')
    await page.addScriptTag({ path: p })
  } catch (e) {
    try {
      await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.11.3/axe.min.js' })
    } catch (err) {
      // If both fail, skip by returning a notable object
      return { error: 'axe-unavailable' }
    }
  }
  // @ts-ignore
  const result = await page.evaluate(async () => {
    // @ts-ignore
    return await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2aa'] } })
  })
  return result
}

test.describe('Accessibility', () => {
  test('homepage should have no WCAG2AA violations', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // wait for main to be visible
    await page.waitForSelector('main')
    const result = await runAxe(page)
    if ((result as any).error === 'axe-unavailable') test.skip(true, 'axe-core unavailable; install axe-core to run accessibility tests locally')
    expect(result.violations, 'Axe violations').toEqual([])
  })

  test('onboarding modal passes axe checks', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // open tutorial modal via injected helper on window (OnboardingTour exposes __showOnboarding)
    await page.evaluate(() => { if ((window as any).__showOnboarding) (window as any).__showOnboarding() })
    // modal should appear
    await page.waitForSelector('[role="dialog"][aria-labelledby="onboarding-title"]', { timeout: 5000 })
    const result = await runAxe(page)
    if ((result as any).error === 'axe-unavailable') test.skip(true, 'axe-core unavailable; install axe-core to run accessibility tests locally')
    expect(result.violations, 'Axe violations in onboarding modal').toEqual([])
  })
})
