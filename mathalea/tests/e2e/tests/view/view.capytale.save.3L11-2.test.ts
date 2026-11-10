import { expect } from '@playwright/test'
import path from 'path'
import type { Page } from 'playwright'
import { fileURLToPath } from 'url'
import prefs from '../../helpers/prefs.js'
import { runTest } from '../../helpers/run.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function testV(page: Page) {
  const port =
    process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')
  const basePath = process.env.CI ? '/alea' : ''
  const origin = `http://localhost:${port}`
  const parentRoutePattern = '**/parent*'
  const parentUrl = `${origin}${basePath}/parent`
  const fallbackParentUrl = `${origin}/parent`
  const moduleMockRoutePattern = '**/modulemock.js*'
  const moduleMockScriptUrl = '/modulemock.js'
  const iframeUrl = `${origin}${basePath}/?recorder=capytale`

  // Mock the api call before navigating
  await page.route(parentRoutePattern, async (route) => {
    await route.fulfill({
      contentType: 'text/html',
      body: `<html>
      <body>
      bonjour
      <div style='height: 90%;'>
      <iframe id='iframe' width="100%" height="100%" allowfullscreen="" src='${iframeUrl}'></iframe>
      </div>
      <script src='${moduleMockScriptUrl}' type='module'></script>
      </body></html>`,
    })
  })
  await page.route(moduleMockRoutePattern, async (route) => {
    await route.fulfill({
      contentType: 'text/javascript',
      path: path.resolve(
        __dirname,
        '../../mock/mock.capytale.save.3L11-2.module.js',
      ),
    })
  })

  // Go to the page
  await page.setDefaultTimeout(1_500_000) // Set timeout to 1_500_000 seconds
  await page.goto(parentUrl)

  try {
    await expect(page.locator('body')).toContainText('bonjour', {
      timeout: 10_000,
    })
  } catch {
    if (parentUrl !== fallbackParentUrl) {
      await page.goto(fallbackParentUrl)
    }
  }
  await expect(page.locator('body')).toContainText('bonjour')

  // await page.locator('#iframe').contentFrame().getByRole('button', { name: 'Exercice 1' }).click()
  // const box = await page.locator('#iframe').contentFrame().locator('.minute-hand').boundingBox()
  // if (box !== null) {
  //   await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  //   await page.mouse.down()
  //   await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2 + 10)
  //   await page.mouse.up()
  // }

  await page.waitForSelector('#iframe')
  await page.waitForTimeout(10_000) // attendre 10_000 ms de plus pour assurer le rendu
  if (page.frames().length > 0) {
    await Promise.all(
      page.frames().map((frame) => frame.waitForLoadState('networkidle')),
    )
  }

  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#divScoreEx0')
      .innerText(),
  ).toBe('4 / 7')

  return true
}

if (process.env.CI) {
  // utiliser pour les tests d'intégration
  prefs.headless = true
  runTest(testV, import.meta.url, { pauseOnError: false })
} else {
  prefs.headless = false
  runTest(testV, import.meta.url, { pauseOnError: true })
}

// pnpm vitest --config tests/e2e/vitest.config.view.js --run tests\e2e\tests\view\view.capytale.save.test.ts
