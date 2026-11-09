import { chromium } from '../mathalea/node_modules/playwright/index.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const base = process.env.MATHALEA_URL ?? 'http://localhost:5173/alea/'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
page.setDefaultTimeout(60000)
const errors = []
page.on('pageerror', error => errors.push(error.message))
mkdirSync(new URL('../validation/screenshots/', import.meta.url), { recursive: true })
try {
  await page.goto(`${base}?uuid=94d21&alea=hqk0&s=1`)
  await page.locator('[data-tip="Lien pour les élèves"]').getByRole('button').click()
  await page.getByRole('tab', { name: 'Course aux nombres' }).click()
  const popupPromise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Visualiser' }).click()
  const popup = await popupPromise
  popup.setDefaultTimeout(60000)
  await popup.getByRole('button', { name: 'Démarrer', exact: true }).click()
  await popup.locator('#time-display-1').waitFor()
  await popup.screenshot({ path: fileURLToPath(new URL('../validation/screenshots/can.png', import.meta.url)) })
  await popup.close()
  const result = await page.evaluate(async () => {
    const moteur = await import('/alea/src/moteur/index.ts')
    await moteur.initialiser()
    const catalogue = await moteur.listerExercices('FR')
    const niveaux = [...new Set(catalogue.map(e => e.niveau))]
    const samples = []
    for (const id of ['6N2A-1', '5N2G', '4A11-0', '3L11', '2N10-1', '1AL10-1', 'TSA1-10']) {
      const candidate = catalogue.find(e => e.id === id)
      if (!candidate) throw new Error(`Exercice absent : ${id}`)
      const params = { uuid: candidate.uuid, nbQuestions: 2, alea: 'datagrade-import-2026', interactif: false }
      const first = await moteur.preparerExercice(params, 0)
      const second = await moteur.preparerExercice(params, 0)
      if (!first.questions.length || first.questions.some(q => !q.enonce || !q.correction)) throw new Error(`Énoncé/correction vide : ${candidate.id}`)
      if (JSON.stringify(first.questions) !== JSON.stringify(second.questions)) throw new Error(`Graine instable : ${candidate.id}`)
      samples.push({ id: candidate.id, uuid: candidate.uuid, questions: first.questions.length })
    }
    return { catalogueEntries: catalogue.length, uniqueUuids: new Set(catalogue.map(e => e.uuid)).size, niveaux, samples }
  })
  assert.equal(errors.length, 0, errors.join('\n'))
  const report = { canStart: 'passed', ...result, pageErrors: errors }
  writeFileSync(new URL('../validation/browser-smoke.json', import.meta.url), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify(report, null, 2))
} finally { await browser.close() }
