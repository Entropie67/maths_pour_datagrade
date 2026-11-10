import Decimal from 'decimal.js'
import {
  checkFeedback,
  getQuestions,
  inputAnswer,
  runTest,
} from '../../helpers/run'
import type { Page } from 'playwright'
import prefs from '../../helpers/prefs.js'

async function test(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice =
    hostname + '?uuid=a0d16&id=4C32&n=20&d=10&s=1&s2=3&alea=N1tD&i=1&cd=1'
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    const a = new Decimal(question.katex.elements[0][0].replace(',', '.'))
    Decimal.set({ toExpNeg: 0 })
    Decimal.set({ toExpPos: 0 })
    let reponse = ''
    if (question.isCorrect) {
      reponse = a.toString().replace('e', '*10^')
    } else {
      reponse = a.mul(-1).toString().replace('e', '*10^')
    }
    await inputAnswer(page, question, reponse)
  }
  await checkFeedback(page, questions)
  return true
}

const local = true
if (process.env.CI) {
  // utiliser pour les tests d'intégration
  prefs.headless = true
  runTest(test, import.meta.url, { pauseOnError: false }) // true pendant le développement, false ensuite
} else {
  runTest(test, import.meta.url)
}
