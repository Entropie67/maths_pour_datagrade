import { expect } from '@playwright/test'
import type { Page } from 'playwright'
import prefs from '../../helpers/prefs.js'
import { runTest } from '../../helpers/run'

async function testEleveView(page: Page) {
  await page.setDefaultTimeout(1_500_000) // Set timeout to 500 seconds
  const goodAnswers = [
    '42',
    '0,64',
    '12',
    '33',
    '105',
    '23',
    '2,5',
    '340',
    '2,8',
    '25', // Q10
    '3',
    '24',
    '11x+15',
    '\\dfrac{7}{5}',
    '\\sqrt{13}', // Q15
    '11',
    '2+\\dfrac{1}{4}=\\dfrac{\\placeholder[champ1]{9}}{\\placeholder[champ2]{4}}',
    '2,24\\times 10^5',
    '49',
    '\\dfrac{13}{19}', // Q20
    '15',
    '5',
    '5',
    '4',
    '20\\pi', // Q25
    '0,51',
    '4,7',
    '147',
    '120',
    '0',
  ]

  const checkBoxesIds: string[] = []
  // const page = await getDefaultPage()
  const hostname = `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
  const urlExercice =
    hostname +
    '?uuid=766ef&n=30&d=10&s=true&s2=1-2-3-4-5-6-7-8-9-10-11-12-13-14-15-16-17-18-19-20-21-22-23-24-25-26-27-28-29-30&s3=false&i=1&cd=1&alea=WBYf&v=eleve&es=0111001'
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
