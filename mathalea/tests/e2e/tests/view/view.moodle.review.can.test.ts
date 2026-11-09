import { expect } from '@playwright/test'
import type { Page } from 'playwright'
import prefs from '../../helpers/prefs.js'
import { runTest } from '../../helpers/run'

/*
  Relecture d'une copie de Course aux nombres transmise par un LMS dans l'URL
  (Moodle recharge l'iframe avec `done=1&answers=…&duration=…`, voir
  `public/assets/externalJs/moodle.scorm.js`).

  Les réponses sont réinjectées dans les questions puis corrigées : le score
  affiché doit donc être recalculé, et le temps repris du paramètre `duration`.
*/
const answers = {
  Ex0Q0: '2\\times2\\times3\\times3\\times7', // 252, bonne réponse
  Ex0Q1: '2\\times2\\times2\\times5\\times5', // 200, bonne réponse
  Ex0Q2: '1', // 80, mauvaise réponse
  Ex0Q3: '1', // 3 200, mauvaise réponse
}

async function testV(page: Page) {
  const port =
    process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')
  const basePath = process.env.CI ? '/alea' : ''
  const url =
    `http://localhost:${port}${basePath}/?id=4A11-0&s=3&s2=true&s3=false&s4=false&n=4` +
    '&alea=question-17889-1&i=1&v=can&recorder=moodle&title=&es=011010&iframe=1' +
    `&done=1&answers=${encodeURIComponent(JSON.stringify(answers))}&duration=137`

  await page.setDefaultTimeout(120_000)
  await page.goto(url)

  await page.waitForSelector('#score')
  // Vérification à chaque étape par défaut : 2 points par question
  expect(await page.locator('#score > span').innerText()).toBe('4/8')
  expect(await page.locator('#time > span').innerText()).toBe('02:17')
  // Seules les réponses fausses ont leur bloc « Réponse donnée » affiché.
  expect(await page.locator('#answer-2').innerText()).toBe('1\n1')
  expect(await page.locator('#answer-3').innerText()).toBe('1\n1')
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
// pnpm vitest --config tests/e2e/vitest.config.view.js --run tests/e2e/tests/view/view.moodle.review.can.test.ts
