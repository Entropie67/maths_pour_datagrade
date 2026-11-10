import Decimal from 'decimal.js'
import {
  checkFeedback,
  getQuestions,
  inputAnswer,
  runTest,
} from '../../helpers/run'
import type { Page } from 'playwright'

async function test(page: Page) {
  const urlExercice =
    'http://localhost:5173/alea/?uuid=bd660&id=4G20&n=20&d=10&s=3&s2=1&alea=vdiV&i=1&cd=1'
  // 4G20 dans le cas où on ne cherche que l'hypoténuse
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    let reponse = ''
    const [a, b] = getNumbers(question.innerText)
    if (question.isCorrect) {
      reponse = a.pow(2).plus(b.pow(2)).sqrt().toFixed(1) + 'cm'
    } else {
      // On fait exprès de faire une erreur d'arrondi et un feedback devrait s'afficher
      // Todo : vérifier que le feedback sur l'arrondi s'affiche bien
      if (a.pow(2).plus(b.pow(2)).sqrt().toFixed(2).at(-1) !== '0') {
        reponse = a.pow(2).plus(b.pow(2)).sqrt().add(0.1).toFixed(2) + 'cm'
      } else {
        reponse = a.pow(2).plus(1).sqrt().add(0.1).toFixed(2) + 'cm'
      }
    }
    await inputAnswer(page, question, reponse)
  }
  await checkFeedback(page, questions)
  return true
}

runTest(test, import.meta.url)

function getNumbers(text: string): Decimal[] {
  const matches = text.match(/\d+(,\d+)?/g)
  return matches
    ? matches.map((match) => new Decimal(parseFloat(match.replace(',', '.'))))
    : []
}
