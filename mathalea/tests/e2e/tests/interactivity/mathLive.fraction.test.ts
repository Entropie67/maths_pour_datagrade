import type { Page } from 'playwright'
import { fraction } from '../../../../src/modules/fractions'
import { KatexHandler } from '../../helpers/KatexHandler'
import prefs from '../../helpers/prefs.js'
import {
  checkFeedback,
  getQuestions,
  inputAnswer,
  runTest,
} from '../../helpers/run'
import { clean } from '../../helpers/text'

async function test(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice =
    hostname + '?uuid=91d72&id=5N10&n=20&d=10&s=3&s2=false&i=1&cd=1'
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    let reponse

    const innerText = clean(question.innerText, ['virgules'])
    if (innerText.includes('décimale')) {
      // l'énoncé fournit une fraction on saisit un décimal
      const katexFraction = new KatexHandler(page, question, {
        has: page.locator('mfrac'),
      })
      const fraction = await katexFraction.getFraction()
      const { num, den } = fraction ?? { num: undefined, den: undefined }
      if (num == null || den == null)
        throw Error(`getFraction n'a pas trouvé la fraction : ${fraction}`)
      const [n, d] = [num, den].map(Number)
      reponse = question.isCorrect
        ? (n / d).toFixed(3).replace('.', ',')
        : (d / n).toFixed(3).replace('.', ',')
    } else {
      // l'énoncé fournit un décimal on saisit une fraction
      const katexExpression = new KatexHandler(page, question, { hasText: ',' })
      const expression = await katexExpression.getExpression()
      if (expression == null) return false
      const exprCleaned = clean(expression, ['espaces', 'cr'])
      const chunks = exprCleaned.match(/\d+,\d+/g)
      if (chunks !== null) {
        const nombre = Number(chunks[0].replace(',', '.'))
        if (nombre != null) {
          // on fabrique la réponse
          const laFraction = fraction(nombre, undefined)
          reponse = question.isCorrect
            ? `${String(laFraction.num)}/${String(laFraction.den)}`
            : `${String(laFraction.den)}/${String(laFraction.num)}`
        }
      }
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
  prefs.headless = false
  runTest(test, import.meta.url)
}
