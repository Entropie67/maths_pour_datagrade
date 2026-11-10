// Pour lancer un test screenshot pour une uuid définie : (exemple 4C30-3 qui a l'uuid 36f8b)
// uuid=36f8b pnpm screenshot

import { runTest } from '../../helpers/run'
import type { Page } from 'playwright'

async function test(page: Page) {
  const uuid =
    Object.entries(process.env)
      .filter(([key]) => key === 'uuid')
      .map((el) => el[1])[0] ?? 'ace0a'
  const urlExercice = `http://localhost:5173/alea/?uuid=${uuid}`
  await page.goto(urlExercice)
  await page.screenshot({ path: `screenshots/${uuid}/prof.png` })
  await page.screenshot({ path: 'screenshots/last/prof.png' })
  const urlStudent = urlExercice + '&v=eleve&es=021100'
  await page.goto(urlStudent)
  await page.screenshot({ path: `screenshots/${uuid}/eleve.png` })
  await page.screenshot({ path: 'screenshots/last/eleve.png' })
  await page.click('text=Voir la correction')
  await page.screenshot({ path: `screenshots/${uuid}/correction.png` })
  await page.screenshot({ path: 'screenshots/last/correction.png' })
  await page.click('text=Nouvel énoncé')
  await page.click('text=Voir la correction')
  await page.screenshot({ path: `screenshots/${uuid}/correction2.png` })
  await page.screenshot({ path: 'screenshots/last/correction2.png' })
  await page.click('text=Nouvel énoncé')
  await page.click('text=Voir la correction')
  await page.screenshot({ path: `screenshots/${uuid}/correction3.png` })
  await page.screenshot({ path: 'screenshots/last/correction3.png' })
  await page.click('text=Rendre interactif')
  await page.screenshot({ path: `screenshots/${uuid}/interactif.png` })
  await page.screenshot({ path: 'screenshots/last/interactif.png' })
  await page.locator('.rounded-full.bx-plus').click({ clickCount: 8 })
  await page.screenshot({ path: `screenshots/${uuid}/interactifZoom.png` })
  await page.screenshot({ path: 'screenshots/last/interactifZoom.png' })
  const urlDiaporama = urlExercice + '&v=diaporama'
  await page.goto(urlDiaporama)
  // await page.click('text=Défilement manuel')
  await page.click('text=Démarrer')
  await page.screenshot({ path: `screenshots/${uuid}/diaporama1.png` })
  await page.screenshot({ path: 'screenshots/last/diaporama1.png' })
  await page.locator('.bx-show').click()
  await page.screenshot({ path: `screenshots/${uuid}/diaporama1corr.png` })
  await page.screenshot({ path: 'screenshots/last/diaporama1corr.png' })
  await page.locator('.bx-show').click()
  await page.screenshot({ path: `screenshots/${uuid}/diaporama1corrQ.png` })
  await page.screenshot({ path: 'screenshots/last/diaporama1corrQ.png' })
  await page.locator('.bx-show').click()
  if ((await page.locator('.step').count()) > 1) {
    await page.locator('.bx-skip-next').click()
    await page.screenshot({ path: `screenshots/${uuid}/diaporama2.png` })
    await page.screenshot({ path: 'screenshots/last/diaporama2.png' })
  }
  const urlLatex = urlExercice + '&v=latex'
  await page.goto(urlLatex)
  await page.click('text=ProfMaquette')
  await page.waitForTimeout(1500)
  await page.screenshot({
    path: `screenshots/${uuid}/latex.png`,
    fullPage: true,
  })
  await page.screenshot({ path: 'screenshots/last/latex.png', fullPage: true })
  const urlCan = urlExercice + '&v=can'
  await page.goto(urlCan)
  await page.click('text=Démarrer')
  await page.waitForTimeout(6000)
  await page.screenshot({ path: `screenshots/${uuid}/can.png` })
  await page.screenshot({ path: 'screenshots/last/can.png' })

  return true
}

runTest(test, import.meta.url, { pauseOnError: true })
