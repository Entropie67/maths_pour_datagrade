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
  const urlExercice = hostname + '?uuid=4ce2d&id=3P10-1&n=20&i=1&s=2'
  // 3P10-1 uniquement dans le cas de la recherche du taux de variation
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    const k = new Decimal(question.katex.elements[0][0].replace(',', '.'))
    let taux = k.minus(1).times(100)
    let reponse = ''
    if (!question.isCorrect) {
      taux = taux.times(-1)
    }
    reponse = taux.greaterThan(0)
      ? '+' + taux.toNumber() + '%'
      : taux.toNumber() + '%'
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
