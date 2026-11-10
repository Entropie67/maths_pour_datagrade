import Decimal from 'decimal.js'
import type { Page } from 'playwright'
import prefs from '../../helpers/prefs.js'
import {
  checkFeedback,
  getQuestions,
  inputAnswerById,
  runTest,
} from '../../helpers/run'

async function test(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice =
    hostname +
    '?uuid=5999f&id=6M11-2&n=4&d=10&s=1&s2=true&s3=1&s4=3&alea=BZOJ&i=1&cd=1'
  const questions = await getQuestions(page, urlExercice)

  // Dans cet exercice avec plusieurs champs, il y a un décalage sur les indices
  // 2 champss par questions donc 0 et 1 pour le premier, 2 et 3 pour le deuxième, etc.
  // Par facilité, je ne mets que des réponses justes

  for (const question of questions) {
    question.isCorrect = true
    let reponsePerimetre = '0 cm'
    let reponseAire = '0 cm^2'
    const regex = /(\d+,\d+|\d+)/g
    const matches = question.innerText.match(regex)
    const [cString, lstring, Lstring, bString] = matches as [
      string,
      string,
      string,
      string,
    ]
    const c = new Decimal(Number(cString.replace(',', '.')))
    const l = new Decimal(Number(lstring.replace(',', '.')))
    const L = new Decimal(Number(Lstring.replace(',', '.')))
    const b = new Decimal(Number(bString.replace(',', '.')))
    const aire = l.times(L).add(l.times(b).div(2))
    const perimetre = L.times(2).add(l).add(b).add(c)
    if (question.isCorrect) {
      reponsePerimetre = perimetre.toString() + 'cm'
      reponseAire = aire.toString() + 'cm^2'
    }

    const q = Number(question.id.replace('0Q', ''))
    await inputAnswerById(page, `0Q${2 * q}`, reponsePerimetre)
    await inputAnswerById(page, `0Q${2 * q + 1}`, reponseAire)
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
  runTest(test, import.meta.url, { pauseOnError: true }) // true pendant le développement, false ensuite
}
