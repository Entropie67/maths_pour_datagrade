import { expect } from '@playwright/test'
import type { Page } from 'playwright'
import prefs from '../../helpers/prefs.js'
import { runTest } from '../../helpers/run'

async function testEleveView(page: Page) {
  await page.setDefaultTimeout(1_500_000) // Set timeout to 500 seconds
  const goodAnswers = [
    '5,6',
    '-46',
    'x^2+x-6',
    '20',
    '9',
    '\\dfrac{-3}{7}',
    '',
    '\\dfrac{2^{5}}{2^{7}}=2^{\\placeholder[champ1]{-2}}',
    '(x-5)(x+5)',
    '\\dfrac{2}{5}',
    '(\\placeholder[champ1]{-1};\\placeholder[champ2]{5})',
    '205',
    '-1',
    ']-1;1[',
    '-1;2',
    '',
    '0',
    '20',
    '300',
    '6',
    '15',
    '\\dfrac{1}{3}',
    '\\overrightarrow{AB}=\\overrightarrow{B{\\placeholder[champ1]{G}}}', // 'F'
    '\\overrightarrow{DE}={\\placeholder[champ1]{-2}}\\overrightarrow{AB}',
    '30',
    '\\dfrac{2}{3}',
    '1',
    '\\{-\\sqrt3;\\sqrt3\\}',
    '4-12x+9x^2',
    '5',
  ]
  // const page = await getDefaultPage()
  const hostname = `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
  const urlExercice =
    hostname +
    '?uuid=4581b&n=30&d=10&s=true&s2=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30&s3=false&i=1&cd=1&alea=lyjz&v=eleve&es=0211001'
  await page.goto(urlExercice, { timeout: 120000 })

  for (let i = 0; i < 30; i++) {
    const mathField = page.locator(`#champTexteEx0Q${i}`)
    if (goodAnswers[i].length > 0) {
      await mathField.evaluate((mf, answer) => {
        ;(mf as any).setValue(answer)
      }, goodAnswers[i])
    }
  }

  const check1 = page.locator('#checkEx0Q15R1')
  const check2 = page.locator('#checkEx0Q6R0')
  await check1.click()
  await check2.click()

  const button = page.locator('#buttonScoreEx0')
  await button.click({ timeout: 40000 })
  const stringScore = await page.locator('#divScoreEx0').first().innerText()
  // Attendre 5 minutes pour analyser les résultats
  // await page.waitForTimeout(5 * 60 * 1000)
  await expect(stringScore).toBe('30 / 30')
  return true
}

if (process.env.CI) {
  // utiliser pour les tests d'intégration
  prefs.headless = true
  runTest(testEleveView, import.meta.url, { pauseOnError: false })
} else {
  prefs.headless = false
  runTest(testEleveView, import.meta.url, { pauseOnError: true })
}
