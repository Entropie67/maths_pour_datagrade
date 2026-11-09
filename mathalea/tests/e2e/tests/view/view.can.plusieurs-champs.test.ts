import { expect } from '@playwright/test'
import type { Page } from 'playwright'
import { runTest } from '../../helpers/run'

/**
 * Course aux nombres avec des exercices qui posent plusieurs champs dans un
 * seul énoncé : 5G3A-9 (`nbQuestions = 3` pour une seule entrée de
 * `listeQuestions`, qui faisait planter « Terminer et enregistrer ») et 6G7B-6
 * (`nbQuestions = 1`, dont seul le premier champ était corrigé et enregistré).
 */
const hostname = `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
const endLabel = 'Terminer et enregistrer les résultats'

type ScoreMessage = {
  action: string
  resultsByExercice: {
    uuid: string
    numberOfPoints: number
    numberOfQuestions: number
    answers: Record<string, string>
    answerTxt?: string
  }[]
}

async function fillFields(page: Page, question: number) {
  const fields = page.locator(
    `#question-content-${question} math-field:visible`,
  )
  await expect(fields).toHaveCount(3)
  for (let i = 0; i < 3; i++) {
    await fields.nth(i).click()
    // MathLive prend le focus de façon asynchrone après le clic
    await page.waitForTimeout(400)
    await page.keyboard.type(`100${i}`)
    await page.waitForTimeout(300)
  }
}

async function testPlusieursChampsDansUnEnonce(page: Page) {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.addInitScript(() => {
    const store = window as unknown as { scoreMessages: unknown[] }
    store.scoreMessages = []
    window.addEventListener('message', (event) => {
      if (event.data?.action === 'mathalea:score') {
        store.scoreMessages.push(event.data)
      }
    })
  })
  await page.goto(
    `${hostname}?uuid=8106a&id=5G3A-9&alea=mnop&uuid=f5569&id=6G7B-6&alea=abcd&v=can&canD=20&canSA=1&canSM=gathered&canI=1&recorder=moodle`,
    { timeout: 200_000 },
  )
  await page.getByRole('button', { name: /Démarrer/ }).click()
  await page.waitForSelector('#time-display-1', { timeout: 30_000 })

  await fillFields(page, 0)
  await page.locator('.bxs-chevron-right').click()
  await fillFields(page, 1)
  await page.locator('#race-ended-by-user-btn').click()
  await page.getByRole('button', { name: endLabel }).last().click()

  await page.waitForSelector('#counter', { timeout: 30_000 })
  // Les numéros saisis n'existent pas dans les pavages : tout est faux.
  await expect(page.locator('#score').first()).toContainText('Score : 0/6')
  expect(pageErrors).toEqual([])

  const messages = await page.evaluate(
    () =>
      (window as unknown as { scoreMessages: ScoreMessage[] }).scoreMessages,
  )
  expect(messages).toHaveLength(1)
  const results = messages[0].resultsByExercice
  // Une entrée par question affichée, avec les trois réponses de chacune
  expect(results.map((result) => result.uuid)).toEqual(['8106a', 'f5569'])
  expect(results.map((result) => result.numberOfQuestions)).toEqual([3, 3])
  expect(results[0].answers).toEqual({
    Ex0Q0: '1000',
    Ex0Q1: '1001',
    Ex0Q2: '1002',
  })
  expect(results[1].answers).toEqual({
    Ex1Q0: '1000',
    Ex1Q1: '1001',
    Ex1Q2: '1002',
  })
  expect(results[0].answerTxt).toBe('1000 ; 1001 ; 1002')

  await page.getByRole('button', { name: /solutions/ }).click()
  await expect(page.locator('#answer-0')).toContainText('1001')
  return true
}

const options = process.env.CI
  ? { headless: true, pauseOnError: false }
  : { headless: false, pauseOnError: true }
runTest(testPlusieursChampsDansUnEnonce, import.meta.url, options)
