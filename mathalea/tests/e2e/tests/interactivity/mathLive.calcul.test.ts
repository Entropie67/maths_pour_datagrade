import type { Page } from 'playwright'
import prefs from '../../helpers/prefs.js'
import {
  checkFeedback,
  getQuestions,
  inputAnswer,
  runTest,
} from '../../helpers/run'
import { clean } from '../../helpers/text'

async function testEntier(page: Page) {
  await page.setDefaultTimeout(200_000) // Set timeout to 200 seconds
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice =
    hostname + '?uuid=cfa6a&id=6C10&n=20&d=10&s=6&s2=3&i=1&cd=1'
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    let reponse

    const innerText = clean(question.innerText, [
      'dollars',
      'espaces',
    ]).replaceAll('\\times', '×')
    const operation = innerText.split('=')[0]
    const operandes = operation.match(/[0-9,]+/g)
    if (operandes != null && operation != null) {
      // on fabrique la réponse
      const chunks = operation.match(/\D/)
      if (chunks != null) {
        const operateur = chunks[0]
        switch (operateur) {
          case '+':
            reponse =
              Number(operandes[0].replace(',', '.')) +
              Number(operandes[1].replace(',', '.')) +
              (question.isCorrect ? 0 : 1)
            break
          case '-':
            reponse =
              Number(operandes[0].replace(',', '.')) -
              Number(operandes[1].replace(',', '.')) +
              (question.isCorrect ? 0 : 1)
            break
          case '×':
            reponse =
              Number(operandes[0].replace(',', '.')) *
                Number(operandes[1].replace(',', '.')) +
              (question.isCorrect ? 0 : 1)
            break
        }
      }
    }

    await inputAnswer(page, question, reponse)
  }
  await checkFeedback(page, questions)
  return true
}

async function testCalculLitteral(page: Page) {
  await page.setDefaultTimeout(200_000) // Set timeout to 200 seconds
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice =
    hostname + '?uuid=db2e0&id=3L11&n=10&d=10&s=3&s2=2&s3=1&s4=true&n=20&i=1'
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    let reponse = ''
    const regex = /([-+]?\d+)\(([-+]?\d*)x([-+]\d+)\)/
    const expression = question.katex.elements[0][0]
    const match = expression.match(regex)

    if (match) {
      const k = stringToNumber(match[1])
      const a = stringToNumber(match[2])
      const b = stringToNumber(match[3])
      if (question.isCorrect) {
        reponse = `${k * a}x${k * b > 0 ? '+' : ''}${k * b}`
      } else {
        reponse = `${k}(${a}x${b > 0 ? '+' : ''}${b})` // Expression égale mais non développée
      }
    } else {
      throw new Error('Pas de match')
    }

    await inputAnswer(page, question, reponse)
  }
  await checkFeedback(page, questions)
  return true
}

async function testCalculLitteral2(page: Page) {
  await page.setDefaultTimeout(200_000) // Set timeout to 200 seconds
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice =
    hostname + '?uuid=db2e0&n=10&d=10&s=3&s2=2&s3=3&s4=true&i=1&cd=1'
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    let reponse = ''
    const regex = /([-+]?\d+)x\(([-+]?\d*)x([-+]\d+)\)/
    const expression = question.katex.elements[0][0]
    const match = expression.match(regex)

    if (match) {
      const k = stringToNumber(match[1])
      const a = stringToNumber(match[2])
      const b = stringToNumber(match[3])
      if (question.isCorrect) {
        reponse = `${k * a}x^2${k * b > 0 ? '+' : ''}${k * b}x`
      } else {
        reponse = `${-k * a}x${k * b > 0 ? '+' : ''}${k * b}`
      }
    } else {
      throw new Error('Pas de match')
    }

    await inputAnswer(page, question, reponse)
  }
  await checkFeedback(page, questions)
  return true
}

async function testRelatifs(page: Page) {
  await page.setDefaultTimeout(200_000) // Set timeout to 200 seconds
  const hostname = local
    ? `http://localhost:${process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')}/alea/`
    : 'https://coopmaths.fr/alea/'
  const urlExercice = hostname + '?uuid=cbc26&id=5R20&i=1'

  // 5R20 les réponses peuvent être de la forme 5 ou (+5) ou (5) ou (-5) ou -5
  const questions = await getQuestions(page, urlExercice)

  for (const question of questions) {
    let reponse = ''
    const regex = /(-?\d+)/g
    const [a, b] = question.katex.elements[0][0].match(regex) as [
      string,
      string,
    ]
    let s = Number(a) + Number(b)
    if (!question.isCorrect) {
      s = s === 0 ? 1 : -1 * s
    }
    if (Math.random() < 0.5) {
      reponse = s.toString()
    } else {
      if (s > 0) {
        if (Math.random() < 0.5) {
          reponse = `(+${s.toString()})`
        } else {
          reponse = `(${s.toString()})`
        }
      } else {
        reponse = `(${s.toString()})`
      }
    }
    await inputAnswer(page, question, reponse)
  }
  await checkFeedback(page, questions)
  return true
}

function stringToNumber(str: string): number {
  if (str === '') {
    return 1
  } else if (str === '-') {
    return -1
  } else if (str === '+') {
    return 1
  }
  return Number(str)
}

const local = true
if (process.env.CI) {
  // utiliser pour les tests d'intégration
  prefs.headless = true
}

runTest(testRelatifs, import.meta.url)
runTest(testEntier, import.meta.url)
runTest(testCalculLitteral, import.meta.url)
runTest(testCalculLitteral2, import.meta.url)
