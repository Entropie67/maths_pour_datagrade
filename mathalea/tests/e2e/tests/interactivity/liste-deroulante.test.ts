import { expect } from '@playwright/test'
import type { Page } from 'playwright'
import { runTest } from '../../helpers/run'
import prefs from '../../helpers/prefs.js'

async function test(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice = hostname + '?uuid=2eee3&i=1&n=1'
  // const questions = await getQuestions(page, urlExercice)
  await page.goto(urlExercice)
  // Ouvre la liste
  await page.locator('liste-deroulante').click()

  // Clique sur l’option voulue
  await page
    .locator('liste-deroulante')
    .getByText('admet pas de solution')
    .click()

  // Vérifie la valeur sélectionnée
  const value = await page.evaluate(() => {
    const el = document.querySelector('liste-deroulante')
    // Cast to HTMLInputElement or appropriate type to access 'value'
    return (el as HTMLInputElement | null)?.value
  })
  expect(value).toBe('aucune') // adapte selon la value attendue
  return true
}

const local = true
if (process.env.CI) {
  // utiliser pour les tests d'intégration
  prefs.headless = true
  runTest(test, import.meta.url, { pauseOnError: false }) // true pendant le développement, false ensuite
} else {
  runTest(test, import.meta.url, { pauseOnError: true }) // true pendant le développement, false ensuite
}
