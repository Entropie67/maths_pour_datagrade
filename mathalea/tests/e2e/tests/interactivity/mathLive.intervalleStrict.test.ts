import type { Page } from 'playwright'
import { arrondi } from '../../../../src/lib/outils/nombres'
import prefs from '../../helpers/prefs.js'
import {
  checkFeedback,
  getQuestions,
  inputAnswer,
  runTest,
} from '../../helpers/run'

async function testSalaires(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice =
    hostname + '?uuid=b8afd&id=3S14&n=20&d=10&s=4&s2=2&s3=true&i=1&cd=1'
  const questions = await getQuestions(page, urlExercice)

  type Couple = [number, number]

  function mediane(couples: Couple[]): string {
    // Trier par valeur
    couples.sort((a, b) => a[0] - b[0])

    // Calculer la somme totale des effectifs
    const total = couples.reduce((sum, couple) => sum + couple[1], 0)

    // Trouver la médiane
    let sum = 0
    let previousCouple: Couple = [NaN, NaN]
    for (const couple of couples) {
      sum += couple[1]
      if (sum === total / 2 && previousCouple) {
        return arrondi((previousCouple[0] + couple[0]) / 2, 1).toString()
      } else if (sum > total / 2) {
        return couple[0].toString()
      }
      previousCouple = couple
    }

    // Si le tableau est vide, retourner null
    return 'null'
  }

  for (const question of questions) {
    let reponse = ''
    const array = question.katex.elements[0]
    const arrayNumber = array.filter((value) =>
      Number.isInteger(parseFloat(value)),
    )
    const couples: Couple[] = []
    for (let i = 0; i < arrayNumber.length; i += 2) {
      couples.push([Number(arrayNumber[i]), Number(arrayNumber[i + 1])])
    }
    if (question.isCorrect) {
      reponse = mediane(couples)
    } else {
      reponse = 'null'
    }
    await inputAnswer(page, question, reponse)
  }
  await checkFeedback(page, questions)
  return true
}

async function testNotes(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice =
    hostname + '?uuid=b8afd&id=3S14&n=20&d=10&s=2&s2=2&s3=true&i=1&cd=1'
  const questions = await getQuestions(page, urlExercice)
  for (const question of questions) {
    let reponse = ''
    const unorderedNotes = question.katex.elements.flatMap((x) => Number(x[0]))
    const notes = unorderedNotes
      .map((note) => Number(note))
      .sort((a, b) => a - b)
    if (question.isCorrect) {
      if (notes.length % 2 === 0) {
        if (notes[notes.length / 2 - 1] === notes[notes.length / 2]) {
          reponse = String(notes[notes.length / 2])
        } else {
          // La moyenne est la réponse attendue plusieurs valeurs dans l'intervalle doivent être acceptées
          // donc on ajoute 0,1 pour vérifier que c'est bien l'intervalle qui est accepté
          reponse = String(
            (notes[notes.length / 2 - 1] + notes[notes.length / 2]) / 2 + 0.1,
          )
        }
      } else {
        reponse = String(notes[Math.floor(notes.length / 2)])
      }
    } else {
      reponse = String(notes[0])
    }
    await inputAnswer(page, question, reponse)
  }
  await checkFeedback(page, questions)
  return true
}

async function test6N1M1(page: Page) {
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice = hostname + '?uuid=b86b9&id=6N1M-1&alea=x9ft&i=1'
  // 6N31-4
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    let reponse = ''
    const a = Number(
      question.katex.elements[0][0].replace('<', '').replace(',', '.'),
    )
    const b = Number(
      question.katex.elements[1][0].replace('<', '').replace(',', '.'),
    )
    if (question.isCorrect) {
      reponse = String((a + b) / 2)
    } else {
      reponse = String(b + 1)
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
  runTest(testSalaires, import.meta.url, { pauseOnError: false })
  runTest(testNotes, import.meta.url, { pauseOnError: false })
  runTest(test6N1M1, import.meta.url, { pauseOnError: false })
} else {
  prefs.headless = false
  runTest(testSalaires, import.meta.url)
  runTest(testNotes, import.meta.url)
  runTest(test6N1M1, import.meta.url)
}
