import FractionEtendue from '../../../../src/modules/FractionEtendue'
import {
  checkFeedback,
  getQuestions,
  inputAnswer,
  runTest,
} from '../../helpers/run'
import type { Page } from 'playwright'
import prefs from '../../helpers/prefs.js'

async function testFractionSimplifiee(page: Page) {
  // Ce test s'assure que les fractions simplifiée pas au maximum sont acceptées
  // et qu'une fraction égale (celle de l'énoncé) mais pas simplifiée n'est pas acceptée
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice =
    hostname + '?uuid=f8f4e&id=5N13&n=20&d=10&s=50&s2=false&i=1&cd=1'
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    const den = Number(question.katex.elements[0][0])
    const num = Number(question.katex.elements[0][1])
    const fraction = new FractionEtendue(num, den)
    let reponse = ''
    if (question.isCorrect) {
      reponse = `${fraction.n}/${fraction.d}` // fraction irréductible
      for (const k of [2, 3, 5, 7, 11, 13, 17, 19, 23]) {
        if (num % k === 0 && den % k === 0) {
          reponse = `${num / k}/${den / k}` // fraction simplifiée mais pas forcément irréductible
          break
        }
      }
    } else {
      reponse = `${fraction.num}/${fraction.den}` // fraction égale mais non simplifiée
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
  runTest(testFractionSimplifiee, import.meta.url, { pauseOnError: false }) // true pendant le développement, false ensuite
} else {
  runTest(testFractionSimplifiee, import.meta.url)
}
