import { expect } from '@playwright/test'
import path from 'path'
import type { Page } from 'playwright'
import { fileURLToPath } from 'url'
import prefs from '../../helpers/prefs.js'
import { runTest } from '../../helpers/run'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function testV(page: Page) {
  const port =
    process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')
  const basePath = process.env.CI ? '/alea' : ''
  const origin = `http://localhost:${port}`
  const parentRoutePattern = '**/parent*'
  const parentUrl = `${origin}${basePath}/parent`
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
        '../../mock/mock.capytale.review.can.1.module.js',
      ),
    })
  })

  // Go to the page
  await page.setDefaultTimeout(1_500_000) // Set timeout to 1_500_000 seconds
  await page.goto(parentUrl)

  await expect(page.locator('body')).toContainText('bonjour')
  await page.waitForSelector('#iframe')
  await page.waitForTimeout(10_000) // attendre 10_000 ms de plus pour assurer le rendu

  if (page.frames().length > 0) {
    await Promise.all(
      page.frames().map((frame) => frame.waitForLoadState('networkidle')),
    )
  }

  // await page.pause()
  // const v1 = await page.locator('#iframe').contentFrame().locator('#answer-8').innerText()

  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#score:first-child > span')
      .innerText(),
  ).toBe('11/11')
  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#answer-0')
      .innerText(),
  ).toBe('8{8}8 h 10{10}10')
  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#answer-1')
      .innerText(),
  ).toBe('200 000 000{200\\,000\\,000}200000000')
  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#answer-2')
      .innerText(),
  ).toBe('600000{600000}600000')
  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#answer-3')
      .innerText(),
  ).toBe('Voir figure')
  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#answer-4')
      .innerText(),
  ).toBe('1{1}1')
  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#answer-5')
      .innerText(),
  ).toBe('1{1}1')
  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#answer-6')
      .innerText(),
  ).toBe('produit')
  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#answer-7')
      .innerText(),
  ).toBe('somme')
  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#answer-8')
      .innerText(),
  ).toBe('différence')
  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#answer-9')
      .innerText(),
  ).toBe('quotient')
  expect(
    await page
      .locator('#iframe')
      .contentFrame()
      .locator('#answer-10')
      .innerText(),
  ).toBe('cinq - mille - quatre - cent - trente - trois')
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

// pnpm vitest --config tests/e2e/vitest.config.view.js --run tests\e2e\tests\view\view.capytale.review.can.1.test.ts
