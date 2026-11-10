import { expect } from '@playwright/test'
import type { Page } from 'playwright'
import prefs from '../../helpers/prefs.js'
import { runTest } from '../../helpers/run'

async function testEleveView(page: Page) {
  await page.setDefaultTimeout(1_500_000) // Set timeout to 500 seconds
  const goodAnswers = [
    '25',
    '4',
    '50',
    '1\\,024',
    '531',
    '5{\\:\\text{h}\\:}25{\\:\\text{min}\\:}',
    '32',
    '40',
    '1+\\dfrac{3}{10}=\\dfrac{{\\placeholder[champ1]{13}}}{10}',
    '',
    '123,4',
    '54',
    '12',
    '172',
    '',
    '',
    '8',
    '5',
    '\\dfrac{38}{100}+\\dfrac{\\placeholder[champ1]{2}}{100}=\\dfrac{4}{10}',
    '6',
    '100',
    '400',
    '0,75',
    '3,2',
    '',
    '1,5',
    '250\\text{ min }=~\\placeholder[champ1]{4}~\\text{h}~\\placeholder[champ2]{10}~\\text{min}',
    '2,4',
    '540',
    '12',
  ]

  const checkBoxesIds = [
    'checkEx0Q9R0',
    'checkEx0Q14R1',
    'checkEx0Q15R0',
    'checkEx0Q24R0',
  ]
  // const page = await getDefaultPage()
  const hostname = `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
  const urlExercice =
    hostname +
    '?uuid=a7c5c&n=30&d=10&s=true&s2=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30&s3=false&i=1&cd=1&alea=XlH4&v=eleve&es=0111001'
  await page.goto(urlExercice, { timeout: 200_000 })

  for (let i = 0; i < goodAnswers.length; i++) {
    const mathField = page.locator(`#champTexteEx0Q${i}`)
    if (goodAnswers[i].length > 0) {
      await mathField.evaluate((mf, answer) => {
        ;(mf as any).setValue(answer)
      }, goodAnswers[i])
    }
  }

  for (const checkBoxId of checkBoxesIds) {
    const checkBox = page.locator(`#${checkBoxId}`)
    await checkBox?.click()
  }

  const button = page.locator('#buttonScoreEx0')
  await button.click()
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
  runTest(testEleveView, import.meta.url, { pauseOnError: false })
}
