import {
  checkFeedback,
  getQuestions,
  inputAnswer,
  runTest,
} from '../../helpers/run'
import type { Page } from 'playwright'
import Grandeur from '../../../../src/modules/Grandeur'
import prefs from '../../helpers/prefs.js'

async function test(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice = hostname + '?uuid=04b0d&i=1&n=20'
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    let reponse = ''
    let v: number
    let unit: string
    if (question.innerText.includes('cube')) {
      let c: number
      ;[c, unit] = getNumberAndUnit(question.katex.elements[0][0])
      v = c * c * c
    } else {
      const [LArray, lArray, hArray] = question.katex.elements
      let L: number
      ;[L, unit] = getNumberAndUnit(LArray[0])
      const [l] = getNumberAndUnit(lArray[0])
      const [h] = getNumberAndUnit(hArray[0])
      v = L * l * h
    }
    if (question.isCorrect) {
      // Une fois sur 2 on fait une conversion dans l'unité de référence
      if (Math.random() > 0.5) {
        reponse = `${v}${unit}^3`
      } else {
        const grandeur = new Grandeur(v, unit + '^3')
        grandeur.convertirEn(grandeur.uniteDeReference)
        reponse = grandeur.toString()
      }
    } else {
      reponse = `${v * 1000}${unit}^3`
    }
    await inputAnswer(page, question, reponse)
  }
  await checkFeedback(page, questions)
  return true
}

/**
 * '4cm' -> [4, 'cm']
 */
function getNumberAndUnit(text: string): [number, string] {
  const parts = text.split(/(\d+)/)
  if (parts.length < 3) {
    return [0, text]
  }
  return [Number(parts[1]), parts.slice(2).join('')]
}

const local = true
if (process.env.CI) {
  // utiliser pour les tests d'intégration
  prefs.headless = true
  runTest(test, import.meta.url, { pauseOnError: false }) // true pendant le développement, false ensuite
} else {
  runTest(test, import.meta.url)
}
