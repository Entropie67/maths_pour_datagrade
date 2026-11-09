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
        '../../mock/mock.capytale.review.module.js',
      ),
    })
  })

  // Go to the page
  await page.setDefaultTimeout(1_500_000) // Set timeout to 1_500_000 seconds
  await page.goto(parentUrl)

  await expect(page.locator('body')).toContainText('bonjour')
  await page.waitForSelector('#iframe')
  await page.waitForTimeout(10_000) // attendre 10_000 ms de plus pour assurer le rendu
  // await page.locator('#iframe').contentFrame().getByRole('button', { name: 'Exercice 1' }).click()
  // await page.pause()

  const value1 = await page
    .locator('#iframe')
    .contentFrame()
    .locator('#exercice0')
    .getByText('/ 1')
    .innerText()
  expect(value1).toEqual('0 / 1')
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: 'Exercice 2' })
    .click()
  const value2 = await page
    .locator('#iframe')
    .contentFrame()
    .locator('#exercice1')
    .getByText('/ 1')
    .innerText()
  expect(value2).toEqual('0 / 1')
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: 'Exercice 3' })
    .click()
  const value3 = await page
    .locator('#iframe')
    .contentFrame()
    .locator('#exercice2')
    .getByText('/ 1')
    .innerText()
  expect(value3).toEqual('0 / 1')
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: 'Exercice 4' })
    .click()
  const value4 = await page
    .locator('#iframe')
    .contentFrame()
    .locator('#exercice3')
    .getByText('/ 2')
    .innerText()
  expect(value4).toEqual('0 / 2')
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: 'Exercice 5' })
    .click()
  const value5 = await page
    .locator('#iframe')
    .contentFrame()
    .locator('#exercice4')
    .getByText('/ 2')
    .innerText()
  expect(value5).toEqual('0 / 2')
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: 'Exercice 6' })
    .click()
  const value6 = await page
    .locator('#iframe')
    .contentFrame()
    .locator('#exercice5')
    .getByText('/ 4')
    .innerText()
  expect(value6).toEqual('0 / 4')
  await page
    .locator('#iframe')
    .contentFrame()
    .getByRole('button', { name: 'Exercice 7' })
    .click()
  const value7 = await page
    .locator('#iframe')
    .contentFrame()
    .locator('#exercice6')
    .getByText('/ 1')
    .innerText()
  expect(value7).toEqual('0 / 1')
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
// pnpm vitest --config tests/e2e/vitest.config.view.js --run tests\e2e\tests\view\view.capytale.review.test.ts
