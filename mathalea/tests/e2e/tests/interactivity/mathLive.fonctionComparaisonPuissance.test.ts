import { clean } from '../../helpers/text'
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
    hostname + '?uuid=1d078&id=4C33-0&n=20&d=10&s=3&s2=3&s3=1&s4=3&i=1&cd=1'
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    let reponse = ''
    const innerText = clean(question.innerText, ['cr'])
    if (innerText.includes('Écrire')) {
      const mantisse = question.katex.elements[0][0]
      const exposant = question.katex.elements[0][1]
      let nombreARepeter
      if (mantisse.startsWith('-')) {
        // cas négatif
        const mantisseSansLeMoins = mantisse.slice(1)
        reponse = '-'
        nombreARepeter = mantisseSansLeMoins
      } else {
        // cas positif
        nombreARepeter = mantisse
      }
      reponse += nombreARepeter
      for (let i = 0; i < Number(exposant) - 1; i++) {
        reponse += '*' + nombreARepeter
      }
      if (!question.isCorrect) reponse = '-' + reponse
    } else if (innerText.includes('Simplifier')) {
      const chaine = question.katex.elements[0][0]
      const nombreQuiSeRepete = chaine.split('×')[1]
      if (chaine.startsWith('-')) reponse = '-'
      reponse += nombreQuiSeRepete + '^' + chaine.split('×').length
      if (!question.isCorrect) reponse = '-' + reponse
    } else {
      throw Error('Ni écrire ni simplifier')
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
