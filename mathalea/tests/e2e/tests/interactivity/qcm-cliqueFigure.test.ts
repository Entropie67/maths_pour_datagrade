import type { Page } from 'playwright'
import ce from '../../../../src/lib/interactif/comparisonFunctions'
import { KatexHandler } from '../../helpers/KatexHandler'
import prefs from '../../helpers/prefs.js'
import { checkFeedback, getQuestions, runTest } from '../../helpers/run'

async function test1(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice = hostname + '?uuid=2a4f4&i=1&alea=5bRC'
  // const questions = await getQuestions(page, urlExercice)
  await page.goto(urlExercice)
  const questions = await getQuestions(page, urlExercice)
  const question = questions[0]
  question.isCorrect = true
  const handlers = [0, 1, 2, 3].map(
    (n) => new KatexHandler(page, question, { index: n }),
  )

  const egalites = await Promise.all(handlers.map((h) => h.getExpression()))
  const status: boolean[] = []
  for (let i = 0; i < 4; i++) {
    egalites[i] = egalites[i]!.replaceAll('\n', '/')
      .replaceAll('/=/', ' et ')
      .replaceAll('/+/', '+')
      .replaceAll('/÷/', '/')
      .replaceAll('/×/', '\\times')
      .replaceAll('/-/', '-')

    const [premierMembre, secondMembre] = egalites[i]!.split(' et ')
    const [value1, value2] = [premierMembre, secondMembre].map((m) =>
      ce.parse(m).evaluate().N().toString(),
    )
    status.push(value1 === value2)
  }
  const indexCorrect = status.findIndex((s) => s)
  const checkboxe = await page
    .locator('.ex0')
    .locator('input[type="radio"]')
    .nth(indexCorrect)
  await checkboxe.check()

  await checkFeedback(page, questions)
  return true
}

async function test2(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice = hostname + '?uuid=83763&i=1&n=3&alea=5bRC'
  // const questions = await getQuestions(page, urlExercice)
  await page.goto(urlExercice)
  const questions = await getQuestions(page, urlExercice)
  questions[0].isCorrect = true
  questions[1].isCorrect = false
  questions[2].isCorrect = true

  for (let i = 0; i < 3; i++) {
    const cliqueFigure = page.locator(
      `clique-figure[numero-exercice="0"][question-index="${i}"]`,
    )
    const serializedFigures = await cliqueFigure.getAttribute('figures')
    if (serializedFigures == null) {
      throw Error(
        `La configuration cliqueFiguresArray de la question ${i + 1} est introuvable`,
      )
    }
    const figures = JSON.parse(serializedFigures) as Array<{
      id: string
      solution: boolean
    }>
    const figuresToClick = questions[i].isCorrect
      ? figures.filter((figure) => figure.solution)
      : figures.filter((figure) => !figure.solution).slice(0, 1)
    if (figuresToClick.length === 0) {
      throw Error(
        `Aucune figure ne permet de produire la réponse attendue à la question ${i + 1}`,
      )
    }
    for (const figure of figuresToClick) {
      await page.locator(`[id="${figure.id}"]`).click()
    }
  }
  await checkFeedback(page, questions)
  return true
}

const local = true
if (process.env.CI) {
  // utiliser pour les tests d'intégration
  prefs.headless = true
  runTest(test1, import.meta.url, { pauseOnError: false }) // true pendant le développement, false ensuite
  runTest(test2, import.meta.url, { pauseOnError: false }) // true pendant le développement, false ensuite
} else {
  prefs.headless = false
  runTest(test1, import.meta.url, { pauseOnError: true }) // true pendant le développement, false ensuite
  runTest(test2, import.meta.url, { pauseOnError: true }) // true pendant le développement, false ensuite
}
