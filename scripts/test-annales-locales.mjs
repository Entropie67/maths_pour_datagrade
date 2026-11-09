import { chromium } from '../mathalea/node_modules/playwright/index.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const base = process.env.MATHALEA_URL ?? 'http://localhost:5180/alea/'
const ids = process.argv.slice(2)
if (!ids.length) ids.push(
  'dnb_2013_04_pondichery_1', 'bac_2021_01_sujet0_1', 'crpe_2022_g1_ex1',
  'dnbpro_2024_06_polynesie_1', 'e3c_2021_01_specimen1_1',
  'eam_specialite_2025_06_sujet0v1_1', 'sti2d_2021_03_sujet0v1_maths',
  'stl_2021_03_metropole_maths',
)
const browser = await chromium.launch({ headless: true })
const reports = []
mkdirSync(new URL('../validation/screenshots/', import.meta.url), { recursive: true })
try {
  for (const uuid of ids) {
    console.log(`Vérification locale : ${uuid}`)
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const externalRequests = []
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.route('**/*', route => {
      const url = new URL(route.request().url())
      if (url.origin !== new URL(base).origin && /^https?:$/.test(url.protocol)) {
        externalRequests.push(url.href)
        return route.abort()
      }
      return route.continue()
    })
    await page.goto(`${base}?uuid=${encodeURIComponent(uuid)}&v=eleve&es=1111111`, { timeout: 60000 })
    const selector = 'img[src*="/static/"],img[src^="static/"],img[src*="assets/crpe/"]'
    await page.locator(selector).first().waitFor({ timeout: 60000 })
    console.log('Images demandées :', await page.locator(selector).evaluateAll(imgs => imgs.map(img => img.src)))
    await page.waitForFunction(selector => [...document.querySelectorAll(selector)].some(img => img.complete && img.naturalWidth > 0), selector, { timeout: 60000 })
    await page.getByRole('button', { name: /Voir la correction/ }).click()
    await page.locator('img[alt="correction"]').first().waitFor({ timeout: 60000 })
    await page.waitForFunction(selector => [...document.querySelectorAll(selector)].every(img => img.complete && img.naturalWidth > 0), selector, { timeout: 60000 })
    const images = await page.locator(selector).evaluateAll(imgs => imgs.map(img => ({ src: img.src, width: img.naturalWidth, height: img.naturalHeight })))
    assert(images.some(img => img.width > 0))
    assert(images.every(img => new URL(img.src).origin === new URL(base).origin), 'Une image utilise encore un serveur externe')
    assert.equal(errors.length, 0, errors.join('\n'))
    await page.screenshot({ path: fileURLToPath(new URL(`../validation/screenshots/annale-${uuid}.png`, import.meta.url)), fullPage: true })
    reports.push({ uuid, statementAndCorrection: 'passed', images, externalRequestsBlocked: externalRequests, pageErrors: errors })
    await page.close()
  }
  writeFileSync(new URL('../validation/annales-browser.json', import.meta.url), JSON.stringify(reports, null, 2) + '\n')
  console.log(JSON.stringify(reports, null, 2))
} finally { await browser.close() }
