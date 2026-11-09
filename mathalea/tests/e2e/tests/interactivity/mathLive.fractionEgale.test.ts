import {
  checkFeedback,
  getQuestions,
  inputAnswer,
  runTest,
} from '../../helpers/run'
import type { Page } from 'playwright'
import { choice } from '../../../../src/lib/outils/arrayOutils'
import { clean } from '../../helpers/text'
import { KatexHandler } from '../../helpers/KatexHandler'
import { extraireCoeffAffine } from '../../helpers/maths'
import FractionEtendue from '../../../../src/modules/FractionEtendue'
import { pgcd } from '../../../../src/lib/outils/primalite'
import prefs from '../../helpers/prefs.js'

async function test(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice =
    hostname + '?uuid=ec059&id=2F20-2&n=10&d=10&s=1&s2=2&i=1&cd=1' // Mettre ici l'url de l'exercice (éventuellement avec la graine mais push sans la graine)
  const questions = await getQuestions(page, urlExercice)
  for (const question of questions) {
    const katexExpression = new KatexHandler(page, question, { hasText: '=' })
    const expression = await katexExpression.getExpression()
    if (expression == null) throw Error("Je n'ai pas trouvé l'expression")
    const enonce = clean(question.innerText, ['espaces', 'cr'])
    let typeDeQuestion = 'abscisse'
    if (enonce.includes('ordonnée?')) {
      typeDeQuestion = 'ordonnee'
    } else if (enonce.includes('abscisse?')) {
      typeDeQuestion = 'abscisse'
    } else {
      throw Error(
        `Je n'ai pas réussi à identifier le type de question dans ${enonce}`,
      )
    }
    // Atention ! Katex modifie les lettres ! Ici, je remplace 𝑥 par x sinon la fonction extraireCoeffAffine ne fonctionne pas !
    // précaution factorisée dans la fonction extraireCoeffDeg3() donc devenu inutile (je la laisse pour l'exemple car il y a aussi les y, les u, les v ...)
    const exprClenead = clean(expression, ['espaces', 'cr'])
      .split('=')[1]
      .replace('𝑥', 'x')
    const [a, b] = extraireCoeffAffine(exprClenead)
    if (typeof a !== 'number' || typeof b !== 'number')
      throw Error("On a des fractions dans l'expression")
    const katexFraction = new KatexHandler(page, question, {
      has: page.locator('mfrac'),
    })
    const fraction = await katexFraction.getFraction()
    const { num, den } = fraction ?? { num: undefined, den: undefined }
    if (num == null || den == null)
      throw Error(`getFraction n'a pas trouvé la fraction : ${fraction}`)
    const [n, d] = [num, den].map(Number)
    const image =
      typeDeQuestion === 'ordonnee' ? (a * n) / d + b : (n - b * d) / (d * a)
    let reponse
    const choix = choice(['décimal', 'fraction'])
    if (choix === 'décimal' && Number(image.toFixed(3)) === image) {
      // si image est égal à son approximation au millième, la saisie décimale est possible
      reponse = question.isCorrect
        ? image.toFixed(3).replace('.', ',')
        : (1 + image).toFixed(3).replace('.', ',')
    }
    if (choix === 'fraction' || reponse == null) {
      // on doit taper une fraction
      const reponses =
        typeDeQuestion === 'ordonnee'
          ? {
              correct: String(a * n + b * d) + '/' + den,
              incorrect: String(a * n + b * d + 1) + '/' + den,
            }
          : {
              correct: String(n - b * d) + '/' + String(d * a),
              incorrect: String(n + 1 - b * d) + '/' + String(d * a),
            }
      reponse = question.isCorrect ? reponses.correct : reponses.incorrect
    }
    await inputAnswer(page, question, reponse)
  }
  await checkFeedback(page, questions)
  return true
}

async function testFractionSimplifieeIrreductible(page: Page) {
  // Ce test s'assure que les fractions simplifiées mais non irréductibles ne sont pas acceptées
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice =
    hostname + '?uuid=f8f4e&id=5N13&n=20&d=10&s=50&s2=true&i=1&cd=1'
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    const den = Number(question.katex.elements[0][0])
    const num = Number(question.katex.elements[0][1])
    const fraction = new FractionEtendue(num, den)
    let reponse = ''
    if (question.isCorrect) {
      reponse = `${fraction.n}/${fraction.d}` // fraction irréductible
    } else {
      reponse = `${fraction.num}/${fraction.den}` // fraction égale mais non simplifiée
      for (const k of [2, 3, 5, 7, 11, 13, 17, 19, 23]) {
        if (num % k === 0 && den % k === 0 && pgcd(num, den) !== k) {
          reponse = `${num / k}/${den / k}` // fraction simplifiée mais pas forcément irréductible
          break
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
}

runTest(test, import.meta.url)
runTest(testFractionSimplifieeIrreductible, import.meta.url)
