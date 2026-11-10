import {
  checkFeedback,
  getQuestions,
  inputAnswer,
  runTest,
} from '../../helpers/run'
import type { Page } from 'playwright'
import Hms from '../../../../src/modules/Hms'
import prefs from '../../helpers/prefs.js'

async function test(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice = hostname + '?uuid=5f315&id=6D11&n=20&i=1'
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    let reponse = ''
    const regex = /(.+)\+(.+)=/
    const expression = question.katex.elements[0][0]
    const match = expression.match(regex)

    if (match) {
      const d1 = Hms.fromString(match[1])
      const d2 = Hms.fromString(match[2])
      if (question.isCorrect) {
        reponse = d1.add(d2).toString()
      } else {
        reponse = d1.add(d2).add(d1).toString()
      }
    } else {
      throw new Error('Pas de match')
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
