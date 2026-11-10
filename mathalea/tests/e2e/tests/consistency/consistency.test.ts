import type { Locator, Page } from 'playwright'
import { logError, logIfVerbose } from '../../helpers/log'
import prefs from '../../helpers/prefs'
import { runTest } from '../../helpers/run'
import {
  type AMCVariation,
  type LatexVariation,
  type Variation,
  type View,
  getLatexFromPage,
  isAMCVariation,
  isLatexVariation,
  isStudentVariation,
  testAllViews,
} from '../../helpers/testAllViews'
import { clean } from '../../helpers/text'

type ExerciseType = 'classique' | 'simple'

type State = {
  url: string
  view: string
  numbers: string[]
  exerciseType: ExerciseType
}

const states: State[] = []
const questionsNb = 20

let exerciseType: ExerciseType = 'classique'

function logState() {
  states.forEach((state) => {
    logIfVerbose(state)
  })
}

async function test(page: Page) {
  await page.setDefaultTimeout(100000) // Set timeout to 100 seconds
  await page.route(
    'https://latexcompiler.duckdns.org/generate',
    async (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: '%PDF-1.4\n%%EOF',
      }),
  )
  const classicExerciseParams =
    'uuid=0e6bd&id=6C10-1&n=10&d=10&s=2-3-4-5-6-7-8-9-10&s2=1&s3=true&uuid=0e6bd&id=6C10-1&n=10&d=10&s=2-3-4-5-6-7-8-9-10&s2=1&s3=true'
  exerciseType = 'classique'
  logIfVerbose('Testing classic exercise')
  await testAllViews(
    page,
    { params: classicExerciseParams, onlyOnce: true, isFullViews: true },
    callback,
  )
  logState()
  const simpleExerciseParams =
    'uuid=4ba86&id=canc3C04&n=10&d=10&cd=1&uuid=4ba86&id=canc3C04&n=10&d=10&cd=1'
  exerciseType = 'simple'
  logIfVerbose('Testing simple exercise')
  await testAllViews(
    page,
    { params: simpleExerciseParams, onlyOnce: true, isFullViews: true },
    callback,
  )
  logState()
  logIfVerbose('Check differences')
  return isConsistent()
}

const callback = async (
  page: Page,
  description: string,
  view: View,
  variation: Variation,
) => {
  logIfVerbose(`Testing ${view} ${variation} ${description}`)
  if (view === 'diaporama') {
    await diaporamaStatePush(page, view)
  } else if (view === 'LaTeX' || view === 'AMC') {
    if (!isLatexVariation(variation) && !isAMCVariation(variation))
      throw new Error('LaTeX or AMC callback called with invalid variation')
    if (view === 'LaTeX' && !isLatexVariation(variation))
      throw new Error('LaTeX invalid variation')
    // if (view === 'AMC' && !isAMCVariation(variation))
    //   throw new Error('AMC invalid variation')
    await LatexStatePush(page, view, variation)
  } else {
    if (view === 'eleve' && !isStudentVariation(variation))
      throw new Error('Student callback called with invalid view')
    await defaultViewStatePush(page, view, variation)
  }
}

async function diaporamaStatePush(page: Page, view: View) {
  const url = page.url()
  const numbers: string[] = []
  const maxQuestionsNb = await page.locator('#stepsContainer > button').count()
  // const maxQuestionsNb = 50
  for (let i = 0; i < maxQuestionsNb; i++) {
    numbers.push(await getSlideshowNumbers(page))
    await page.locator('.bx-skip-next').click()
  }
  states.push({
    url,
    view,
    numbers,
    exerciseType,
  })
}

async function getSlideshowNumbers(page: Page) {
  await page.waitForSelector('#question0')
  const locator = page.locator('#question0')
  const innerText = await locator.innerText()
  const number = clean(innerText, ['cr']).replace(/\D/g, '')
  return number
}

async function LatexStatePush(
  page: Page,
  view: 'LaTeX' | 'AMC',
  variation: LatexVariation | AMCVariation,
) {
  const url = page.url()
  const latex = await getLatexFromPage(page)
  const numbers = getLatexNumbers(latex, view, variation)
  states.push({
    url,
    view: view + ':' + variation,
    numbers,
    exerciseType,
  })
}

function getLatexNumbers(
  latex: string,
  view: 'LaTeX' | 'AMC',
  model: LatexVariation | AMCVariation,
) {
  const lineRegex: RegExp =
    view === 'LaTeX'
      ? model === 'Can'
        ? /\\CompteurTC\s+&[^\r\n]*/g
        : /\\item[^\r\n]*/g
      : /\$ [^\r\n]*/g
  let rawLines: string[] = latex.match(lineRegex) || []
  if (
    view === 'LaTeX' &&
    (model === 'ProfMaquette' || model === 'ProfMaquetteQrcode') &&
    exerciseType === 'simple'
  ) {
    rawLines = rawLines.filter((line) => !/^\\item\s*\$/.test(line))
  }
  if (model === 'Can') {
    const rawNumbers = rawLines.map((line) => line.replace(/\D/g, ''))
    // const cleanNumbers = rawNumbers.map(number => number.slice(1))
    const cleanNumbers = rawNumbers
    return cleanNumbers.map((number) => number + number)
  } else {
    const numbersQuestionsAnswers = rawLines.map(
      (line) => line.replace(/\D/g, '') + line.replace(/\D/g, ''),
    )
    return removeAnswers(numbersQuestionsAnswers, view, model, rawLines.length)
  }
}

function removeAnswers(
  calculationsQuestionsAnswers: string[],
  view: 'LaTeX' | 'AMC',
  model: LatexVariation | AMCVariation,
  linesNumber: number,
): string[] {
  if (view === 'LaTeX') {
    if (model === 'ProfMaquette' || model === 'ProfMaquetteQrcode') {
      if (exerciseType === 'simple') return calculationsQuestionsAnswers
      const firstExercise = calculationsQuestionsAnswers.slice(
        0,
        questionsNb / 2,
      )
      const secondExercise = calculationsQuestionsAnswers.slice(
        questionsNb,
        questionsNb + questionsNb / 2,
      )
      return [...firstExercise, ...secondExercise]
    } else {
      return calculationsQuestionsAnswers.slice(0, linesNumber / 2) // Supprime la deuxième moitié qui correspond aux réponses
    }
  } else {
    return calculationsQuestionsAnswers
  }
}

async function defaultViewStatePush(
  page: Page,
  view: View,
  variation: Variation,
) {
  const url = page.url()
  const katex = page.locator('.katex:visible')
  await katex.first().waitFor({ state: 'visible' })
  const locators = await katex.all()
  const numbers = await getNumbers(locators)
  states.push({
    url,
    view: variation === '' ? view : `${view}:${variation}`,
    numbers,
    exerciseType,
  })
}

async function getNumbers(locators: Locator[]) {
  const numbers: string[] = []
  for (const locator of locators) {
    const innerText = await locator.innerText()
    const number = clean(innerText, ['cr']).replace(/\D/g, '')
    numbers.push(normalizeRepeatedNumber(number))
  }
  return numbers.filter((n) => n !== '')
}

function normalizeRepeatedNumber(number: string): string {
  if (number.length % 3 !== 0) return number
  const chunkLength = number.length / 3
  const chunk = number.slice(0, chunkLength)
  if (chunk !== '' && number === chunk.repeat(3)) return chunk.repeat(2)
  return number
}

function isConsistent() {
  const differenceIndexes = getDifferencesIndexes()
  if (differenceIndexes.length > 0) {
    for (const differenceIndex of differenceIndexes) {
      logError(
        `Il y a une différence entre la vue ${states[differenceIndex - 1].view} et la vue ${states[differenceIndex].view} pour les exercices de type ${states[differenceIndex].exerciseType}`,
      )
      logError(states[differenceIndex - 1], states[differenceIndex])
    }
    return false
  }
  return true
}

function getDifferencesIndexes() {
  const differenceIndexes: number[] = []
  for (let i = 1; i < states.length; i++) {
    if (
      states[i].view === 'eleve:Course aux nombres' ||
      states[i - 1].view === 'eleve:Course aux nombres'
    ) {
      continue
    }
    for (let j = 0; j < states[i].numbers.length; j++) {
      if (
        states[i].exerciseType === states[i - 1].exerciseType &&
        states[i].numbers[j] !== states[i - 1].numbers[j] &&
        !(
          states[i].exerciseType === 'simple' &&
          (states[i].view.startsWith('AMC:') ||
            states[i - 1].view.startsWith('AMC:'))
        ) // Les exercices simples n'ont pas de sortie AMC
      ) {
        differenceIndexes.push(i)
        break
      }
    }
  }
  return differenceIndexes
}

if (process.env.CI) {
  // utiliser pour les tests d'intégration
  prefs.headless = true
  runTest(test, import.meta.url, { pauseOnError: false })
} else {
  prefs.slowMo = 0
  runTest(test, import.meta.url, { pauseOnError: true })
}
