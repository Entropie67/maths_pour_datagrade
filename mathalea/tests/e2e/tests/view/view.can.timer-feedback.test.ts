import { expect } from '@playwright/test'
import type { Page } from 'playwright'
import { runTest } from '../../helpers/run'

/**
 * Course aux nombres : chronomètre par question (`canQ`) et feedback après
 * chaque question (`canFB`). 2024 de 2nde, 30 questions, dont la première est
 * « 2 × 1,5 = ».
 */
const hostname = `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
const endLabel = 'Terminer et enregistrer les résultats'
const lastQuestion = 30

/** Messages de score envoyés au recorder (Moodle) depuis le début de la course. */
async function scoreMessages(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      (window as unknown as { scoreMessages: unknown[] }).scoreMessages.length,
  )
}

async function startCan(page: Page, extraParams: string) {
  await page.addInitScript(() => {
    ;(window as unknown as { scoreMessages: unknown[] }).scoreMessages = []
    window.addEventListener('message', (event) => {
      if (event.data?.action === 'mathalea:score') {
        ;(window as unknown as { scoreMessages: unknown[] }).scoreMessages.push(
          event.data,
        )
      }
    })
  })
  await page.goto(
    `${hostname}?uuid=94d21&id=can2a-2024&n=4&alea=abcd&v=can&canD=2&canTi=Test&canT=2026&canSA=1&canSM=gathered&canI=1${extraParams}`,
    { timeout: 200_000 },
  )
  await page.getByRole('button', { name: /Démarrer/ }).click()
  await page.waitForSelector('#time-display-1', { timeout: 30_000 })
}

/** Numéro (à partir de 1) de la question affichée. */
async function currentQuestion(page: Page): Promise<number> {
  const id = await page
    .locator('#questions-container > div:not(.hidden)')
    .first()
    .getAttribute('id')
  return Number(id?.replace('question-content-', '')) + 1
}

async function typeAnswer(page: Page, key: string) {
  await page.locator(`.key--${key}`).click()
  // la saisie doit être prise en compte avant de valider avec Entrée
  await expect(page.locator('nav li div.h-3').first()).toBeVisible()
}

async function finishAndCheckEnd(page: Page, expectedScore: string) {
  await page.waitForSelector('#counter', { timeout: 30_000 })
  await expect(page.locator('#score').first()).toContainText(
    `Score : ${expectedScore}`,
  )
  await page.getByRole('button', { name: /solutions/ }).click()
  await expect(page.getByText('Corrections')).toBeVisible()
}

async function goToLastQuestion(page: Page) {
  await page
    .getByRole('tab', { name: String(lastQuestion), exact: true })
    .click()
}

/** Chronomètre global, feedback à la fin : comportement historique. */
async function testDefault(page: Page) {
  await startCan(page, '')
  await expect(page.locator('#can-primary-btn')).toHaveCount(0)
  // « Terminer et enregistrer les résultats » est réservé à la dernière question
  await expect(page.locator('#race-ended-by-user-btn')).toHaveCount(0)
  await expect(page.locator('.bx-home, .bxs-home')).toHaveCount(0)
  await page.locator('.bxs-chevron-right').click()
  expect(await currentQuestion(page)).toBe(2)
  await goToLastQuestion(page)
  await expect(page.locator('#race-ended-by-user-btn')).toBeVisible()
  await page.waitForTimeout(5_500)
  await page.locator('#race-ended-by-user-btn').click()
  await page.getByRole('button', { name: endLabel }).last().click()
  await page.waitForSelector('#counter', { timeout: 30_000 })
  await page.getByRole('button', { name: /solutions/ }).click()
  // le retour aux réglages n'est proposé qu'à la correction globale
  await expect(page.locator('.bxs-home, .bx-home')).toHaveCount(1)
  return true
}

/** Chronomètre par question sans feedback. */
async function testTimerPerQuestion(page: Page) {
  await startCan(page, '&canQ=3')
  expect(await currentQuestion(page)).toBe(1)
  await expect(page.locator('#can-primary-btn')).toHaveText('Question suivante')
  // pas de retour en arrière : les numéros ne sont pas cliquables
  await expect(page.getByRole('tab', { name: '5', exact: true })).toBeDisabled()
  // le temps écoulé fait passer à la question suivante
  await expect.poll(() => currentQuestion(page), { timeout: 8_000 }).toBe(2)
  await page.locator('#can-primary-btn').click()
  expect(await currentQuestion(page)).toBe(3)
  // « Terminer et enregistrer les résultats » est réservé à la dernière question
  await expect(page.locator('#race-ended-by-user-btn')).toHaveCount(0)
  return true
}

/** Chronomètre par question et feedback après chaque question. */
async function testTimerPerQuestionWithFeedback(page: Page) {
  await startCan(page, '&canQ=4&canFB=1&recorder=moodle&coef=2')
  await expect(page.locator('#can-primary-btn')).toHaveText('Valider')
  await expect(page.locator('#race-ended-by-user-btn')).toHaveCount(0)
  // bonne réponse : 2 × 1,5 = 3
  await typeAnswer(page, '3')
  await page.locator('#can-primary-btn').click()
  await expect(page.locator('#can-feedback-result')).toContainText(
    'Bonne réponse',
  )
  await page.locator('#can-primary-btn').click()
  expect(await currentQuestion(page)).toBe(2)
  // question 2 laissée sans réponse : le temps écoulé déclenche le feedback
  await expect(page.locator('#can-feedback-result')).toContainText(
    'Mauvaise réponse',
    { timeout: 8_000 },
  )
  await expect(page.locator('#can-primary-btn')).toHaveText('Question suivante')
  // les questions suivantes sont validées jusqu'à la dernière
  expect(await scoreMessages(page)).toBe(0)
  for (let i = 2; i < lastQuestion; i++) {
    await page.locator('#can-primary-btn').click() // question suivante
    await page.locator('#can-primary-btn').click() // valider (sans réponse)
    await expect(page.locator('#can-feedback-result')).toBeVisible()
  }
  // un seul bouton de fin avec feedback : le score est déjà envoyé au recorder
  await expect(page.locator('#race-ended-by-user-btn')).toHaveCount(0)
  await expect(page.locator('#can-primary-btn')).toHaveText('Terminer')
  expect(await scoreMessages(page)).toBe(1)
  await page.locator('#can-primary-btn').click()
  await finishAndCheckEnd(page, '2/60')
  const recorded = await page.evaluate(() => {
    const messages = (
      window as unknown as {
        scoreMessages: {
          resultsByExercice: {
            numberOfPoints: number
            numberOfQuestions: number
          }[]
        }[]
      }
    ).scoreMessages
    return messages[0].resultsByExercice.reduce(
      (total, result) => ({
        points: total.points + result.numberOfPoints,
        maximum: total.maximum + result.numberOfQuestions,
      }),
      { points: 0, maximum: 0 },
    )
  })
  expect(recorded).toEqual({ points: 2, maximum: 60 })
  // « Terminer » n'envoie pas une seconde fois le score
  expect(await scoreMessages(page)).toBe(1)
  return true
}

/** Chronomètre global avec feedback après chaque question. */
async function testGlobalTimerWithFeedback(page: Page) {
  await startCan(page, '&canFB=1')
  await expect(page.locator('#can-primary-btn')).toHaveText('Valider')
  await typeAnswer(page, '3')
  await page.keyboard.press('Enter')
  await expect(page.locator('#can-feedback-result')).toContainText(
    'Bonne réponse',
  )
  // le chronomètre global est en pause pendant l'affichage du feedback
  const timeDuringFeedback = await page.locator('#time-display-1').innerText()
  await page.waitForTimeout(2_500)
  await expect(page.locator('#time-display-1')).toHaveText(timeDuringFeedback)
  await page.keyboard.press('Enter')
  expect(await currentQuestion(page)).toBe(2)
  // ... et reprend dès que la question suivante est affichée
  await expect(page.locator('#time-display-1')).not.toHaveText(
    timeDuringFeedback,
    { timeout: 3_000 },
  )
  return true
}

const options = process.env.CI
  ? { headless: true, pauseOnError: false }
  : { headless: false, pauseOnError: true }
runTest(testDefault, import.meta.url, options)
runTest(testTimerPerQuestion, import.meta.url, options)
runTest(testTimerPerQuestionWithFeedback, import.meta.url, options)
runTest(testGlobalTimerWithFeedback, import.meta.url, options)
