import { expect } from '@playwright/test'
import type { Page } from 'playwright'
import prefs from '../../helpers/prefs.js'
import { runTest } from '../../helpers/run'

const customElementModules = [
  '/alea/src/lib/apigeom/apigeom-figure.ts',
  '/alea/src/lib/customElements/BlocklyEditor.ts',
  'CalculatorElement',
  'CliqueFigureElement',
  'CubeStackEditorElement',
  'DecompositionFacteursPremiersElement',
  'DiagramBarAssessmentElement',
  'DiagramBuilderElement',
  'DiagramCartesianAssessmentElement',
  'DiagramHistogramAssessmentElement',
  'DiagramPieAssessmentElement',
  'DomReadyAction',
  'DragAndDropElement',
  'EchiquierProblemeElement',
  'ElementIepEditeur',
  'EnsembleIntervallesDroiteElement',
  'EtoileCalculsElement',
  'FillInTheBlank',
  'FractionCliquableElement',
  'GrimukuGrilleElement',
  'GuideAne',
  'InteractiveClock',
  'IntervalleDroiteElement',
  'JuniperGreenElement',
  'KenKenGrilleElement',
  'KillerSudokuGrilleElement',
  'LabyrintheBlockly',
  'ListeDeroulanteElement',
  'MathaleaBranchingQcm',
  'MathaleaCompteEstBonElement',
  'MathaleaCouteauSuisse',
  'MathaleaLabyrintheElement',
  'MathaleaMathfield',
  'MathaleaQcm',
  'MathaleaSolveurElement',
  'MathaleaTextfield',
  'MetaCustomElement',
  'MetaInteractif2dElement',
  'MultiMathfield',
  'MySpreadSheet',
  'ObjetsCliquablesElement',
  'PointsCliquablesElement',
  'PossibleMultiLinesAnswerElement',
  'PyramideNombresElement',
  'RelierEtiquettesElement',
  'SchemaEnBarreElement',
  'ScratchEditor',
  'Shape2DGridEditorElement',
  'SvgSelectionElement',
  'TableauHybride',
  'TableauMathlive',
  'TableauSignesVariationsElement',
  'TablesEffaceesGrilleElement',
  'TraceurDeCourbe',
  'TrigoCircleSelectionElement',
  '/alea/src/lib/customElements/demi_droite_interactive.ts',
] as const

// Ces éléments ne possèdent pas de réponse autonome dans exercice.answers.
// Ils orchestrent une action ou délèguent la persistance à leurs enfants.
const technicalElementsWithoutOwnReplay = new Set([
  'apigeom-figure',
  'labyrinthe-blockly',
  'mathalea-dom-ready',
  'meta-custom',
  'meta-interactif-2d',
])

type ReplayResult = {
  tag: string
  before?: unknown
  after?: unknown
  error?: string
}

async function testCustomElementsSerializedReplay(page: Page) {
  const port =
    process.env.PLAYWRIGHT_SERVER_PORT ?? (process.env.CI ? '80' : '5173')
  const origin = `http://localhost:${port}`
  await page.goto(`${origin}/alea/`)

  await Promise.all(
    customElementModules.map((moduleName) => {
      const path = moduleName.startsWith('/')
        ? moduleName
        : `/alea/src/lib/customElements/${moduleName}.ts`
      return page.addScriptTag({ type: 'module', url: `${origin}${path}` })
    }),
  )
  await page.addScriptTag({
    type: 'module',
    content: `
      import { listOfCustomElements, mathaleaCustomElementsRegistry } from '/alea/src/lib/customElements/MathaleaCustomElement.ts'
      window.__mathaleaReplayRegistry = { listOfCustomElements, mathaleaCustomElementsRegistry }
    `,
  })
  await page.addScriptTag({
    type: 'module',
    content: `
      import handleInteractiveClock from '/alea/src/lib/customElements/InteractiveClock.ts'
      handleInteractiveClock()
    `,
  })
  await page.waitForFunction(() => '__mathaleaReplayRegistry' in window)

  const results = await page.evaluate(
    async ({ exemptions }): Promise<ReplayResult[]> => {
      const { listOfCustomElements, mathaleaCustomElementsRegistry } = (
        window as typeof window & {
          __mathaleaReplayRegistry: {
            listOfCustomElements: string[]
            mathaleaCustomElementsRegistry: Map<
              string,
              CustomElementConstructor
            >
          }
        }
      ).__mathaleaReplayRegistry

      return listOfCustomElements.map((tag: string) => {
        if (exemptions.includes(tag)) return { tag }
        const elementClass = mathaleaCustomElementsRegistry.get(tag)
        if (elementClass == null) {
          return { tag, error: 'classe absente du registre' }
        }

        let prototype: object | null = elementClass.prototype
        let descriptor: PropertyDescriptor | undefined
        while (prototype != null && descriptor == null) {
          descriptor = Object.getOwnPropertyDescriptor(prototype, 'value')
          prototype = Object.getPrototypeOf(prototype)
        }
        if (descriptor?.get == null || descriptor.set == null) {
          return { tag, error: 'getter/setter value manquant sans exemption' }
        }

        try {
          const template = document.createElement('template')
          template.innerHTML = `<${tag}></${tag}>`
          const element = template.content.firstElementChild as HTMLElement & {
            value: unknown
          }
          const before = element.value
          const storedAnswer =
            typeof before === 'string' ? before : JSON.stringify(before)
          element.value = storedAnswer
          const after = element.value
          const normalizedStoredAnswer =
            typeof after === 'string' ? after : JSON.stringify(after)
          element.value = normalizedStoredAnswer
          return { tag, before: after, after: element.value }
        } catch (error) {
          return {
            tag,
            error: error instanceof Error ? error.message : String(error),
          }
        }
      })
    },
    {
      exemptions: [...technicalElementsWithoutOwnReplay],
    },
  )

  const failures = results.filter(
    ({ tag, before, after, error }) =>
      !technicalElementsWithoutOwnReplay.has(tag) &&
      (error != null || JSON.stringify(after) !== JSON.stringify(before)),
  )
  expect(failures).toEqual([])

  const solverReplayUrl = `${origin}/alea/?uuid=b74c8&n=1&d=10&s=1&alea=rejeu-mathalea-solveur&i=1&cd=1`
  const mountSolverFixture = async () => {
    await page.addScriptTag({
      type: 'module',
      content: `
        import Exercice from '/alea/src/exercices/Exercice.ts'
        import { addMathaleaSolveur, MathaleaSolveurElement } from '/alea/src/lib/customElements/MathaleaSolveurElement.ts'
        import { mathaleaWriteStudentPreviousAnswers } from '/alea/src/lib/mathaleaUtils.ts'

        const exercice = new Exercice()
        exercice.numeroExercice = 91
        exercice.interactif = true
        exercice.autoCorrection[0] = {
          valeur: { reponse: { value: 'x=3' } },
          formatInteractif: 'mathalea-solveur',
        }
        document.querySelector('#solver-replay-fixture')?.remove()
        const container = document.createElement('div')
        container.id = 'solver-replay-fixture'
        container.innerHTML = addMathaleaSolveur(exercice, 0, {
          initial: '2x+4=10',
          kind: 'equation',
          mode: 'evaluation',
        })
        document.body.append(container)
        window.__mathaleaSolverReplayFixture = {
          exercice,
          elementClass: MathaleaSolveurElement,
          writeAnswers: mathaleaWriteStudentPreviousAnswers,
        }
      `,
    })
    await page.waitForSelector('#mathalea-solveurEx91Q0 math-field')
  }

  await page.goto(solverReplayUrl)
  await mountSolverFixture()
  const solverInput = page.locator('#mathalea-solveurEx91Q0-line-1')
  await solverInput.focus()
  await page.waitForSelector('#mathalea-virtual-keyboard')
  await page.locator('#mathalea-virtual-keyboard button.key--1').click()
  await expect(solverInput).toHaveJSProperty('value', '1')
  const solverBeforeReplay = await page.evaluate(() => {
    const fixture = (
      window as typeof window & {
        __mathaleaSolverReplayFixture: {
          exercice: {
            answers?: Record<string, string>
          }
          elementClass: {
            verifQuestion: (
              exercice: unknown,
              questionIndex: number,
            ) => unknown
          }
        }
      }
    ).__mathaleaSolverReplayFixture
    const solver = document.querySelector(
      '#mathalea-solveurEx91Q0',
    ) as HTMLElement & { value: string }
    const input = solver.querySelectorAll('math-field')[1] as HTMLElement & {
      value: string
    }
    input.value = 'x=3'
    input.dispatchEvent(new InputEvent('input', { bubbles: true }))
    solver.querySelector<HTMLButtonElement>('.evaluate')?.click()
    const score = fixture.elementClass.verifQuestion(fixture.exercice, 0)
    return {
      storedAnswer: fixture.exercice.answers?.[solver.id],
      value: solver.value,
      score,
    }
  })

  await page.goto(solverReplayUrl)
  await mountSolverFixture()
  const solverAfterReplay = await page.evaluate(
    async (storedAnswer) => {
      const fixture = (
        window as typeof window & {
          __mathaleaSolverReplayFixture: {
            exercice: unknown
            elementClass: {
              verifQuestion: (
                exercice: unknown,
                questionIndex: number,
              ) => unknown
            }
            writeAnswers: (
              answers: Record<string, string>,
            ) => Promise<boolean>[]
          }
        }
      ).__mathaleaSolverReplayFixture
      await Promise.all(
        fixture.writeAnswers({
          'mathalea-solveurEx91Q0': storedAnswer,
        }),
      )
      const solver = document.querySelector(
        '#mathalea-solveurEx91Q0',
      ) as HTMLElement & { value: string }
      return {
        value: solver.value,
        score: fixture.elementClass.verifQuestion(fixture.exercice, 0),
      }
    },
    solverBeforeReplay.storedAnswer ?? '',
  )

  expect(solverBeforeReplay.storedAnswer).toBe('x=3')
  expect(solverAfterReplay.value).toBe(solverBeforeReplay.value)
  expect(solverAfterReplay.score).toEqual(solverBeforeReplay.score)

  const exerciseUrl = `${origin}/alea/?uuid=b74c8&n=1&d=10&s=1&alea=rejeu-tableau-hybride&i=1&cd=1`
  await page.goto(exerciseUrl)
  await page.waitForSelector('tableau-hybride math-field')
  const savedAnswer = await page.evaluate(() => {
    const tableau = document.querySelector('tableau-hybride') as HTMLElement & {
      value: Record<string, string>
    }
    const data = JSON.parse(tableau.getAttribute('tableau') ?? '{}') as {
      rows?: Array<Array<{ id?: string; value?: string | number }>>
    }
    const answer: Record<string, string> = {}
    data.rows?.flat().forEach((cell) => {
      if (cell.id != null && cell.value != null) {
        answer[cell.id] = String(cell.value)
      }
    })
    tableau.value = answer
    return JSON.stringify(tableau.value)
  })
  await page.locator('#verif0').click()
  const scoreBeforeReplay = await page
    .locator('tableau-hybride [data-result-cell-id]')
    .allTextContents()

  await page.goto(exerciseUrl)
  await page.waitForSelector('tableau-hybride math-field')
  await page.evaluate((storedAnswer) => {
    const tableau = document.querySelector('tableau-hybride') as HTMLElement & {
      value: string
    }
    tableau.value = storedAnswer
  }, savedAnswer)
  await page.locator('#verif0').click()
  const scoreAfterReplay = await page
    .locator('tableau-hybride [data-result-cell-id]')
    .allTextContents()

  expect(scoreAfterReplay).toEqual(scoreBeforeReplay)
  expect(scoreAfterReplay.every((state) => state === '😎')).toBe(true)

  // 4C11 : A = 30×(-5)÷(-6) = 25 et B = -63÷(5+2) = -9 avec cette graine.
  const multiLinesUrl = `${origin}/alea/?uuid=62f66&n=2&d=10&s=3&alea=abc&i=1&cd=1`
  const multiLinesResults = async () =>
    page.evaluate(async () => {
      document.querySelector<HTMLButtonElement>('#verif0')?.click()
      await new Promise((resolve) => setTimeout(resolve, 300))
      return Array.from(
        document.querySelectorAll(
          'possible-multi-lines-answer [data-pmla-result], possible-multi-lines-answer span[id^="resultatCheck"]',
        ),
      ).map((span) => span.textContent)
    })
  await page.goto(multiLinesUrl)
  await page.waitForSelector('possible-multi-lines-answer math-field')
  const multiLinesBefore = await page.evaluate(() => {
    const steps = [
      ['-150\\div(-6)', '25'],
      ['-63\\div8', '-9'],
    ]
    return steps.map((lines, q) => {
      const element = document.querySelector(
        `#possible-multi-lines-answerEx0Q${q}`,
      ) as HTMLElement & { value: string[] }
      lines.forEach((line, k) => {
        const field = document.querySelector(`#champTexteEx0Q${q}`) as
          (HTMLElement & { value: string }) | null
        if (field != null) field.value = line
        if (k < lines.length - 1) {
          element.querySelector<HTMLButtonElement>('[data-pmla-add]')?.click()
        }
      })
      return JSON.stringify(element.value)
    })
  })
  const multiLinesScoreBefore = await multiLinesResults()

  await page.goto(multiLinesUrl)
  await page.waitForSelector('possible-multi-lines-answer math-field')
  const multiLinesAfter = await page.evaluate((storedAnswers) => {
    return storedAnswers.map((storedAnswer, q) => {
      const element = document.querySelector(
        `#possible-multi-lines-answerEx0Q${q}`,
      ) as HTMLElement & { value: string[] | string }
      element.value = storedAnswer
      return JSON.stringify(element.value)
    })
  }, multiLinesBefore)
  const multiLinesScoreAfter = await multiLinesResults()

  expect(multiLinesAfter).toEqual(multiLinesBefore)
  expect(multiLinesScoreBefore).toEqual(['✓', '😎', '✗', '✓'])
  expect(multiLinesScoreAfter).toEqual(multiLinesScoreBefore)

  // 5N1L-5 : algorithme de décomposition, vérification à chaque étape (s2=2) avec
  // une erreur sur le premier diviseur pour que l'état restauré porte un barré.
  const decompositionUrl = `${origin}/alea/?uuid=984fb&n=1&d=10&s=2&s2=2&alea=abc&i=1&cd=1`
  const decompositionTag = '#decomposition-facteurs-premiersEx0Q0'
  const decompositionResult = async () =>
    page.evaluate(async (selector) => {
      document.querySelector<HTMLButtonElement>('#verif0')?.click()
      await new Promise((resolve) => setTimeout(resolve, 300))
      const element = document.querySelector(selector) as HTMLElement
      return {
        resultat: element.querySelector('[id^="resultatCheck"]')?.textContent,
        barres: element.querySelectorAll('.dfp-barre').length,
      }
    }, decompositionTag)
  await page.goto(decompositionUrl)
  await page.waitForSelector(`${decompositionTag} math-field`)
  const decompositionBefore = await page.evaluate(async (selector) => {
    const element = document.querySelector(selector) as HTMLElement & {
      value: unknown
    }
    const saisis = async (valeur: string) => {
      const champ = element.querySelector('mathalea-mathfield.dfp-champ')
      const mathfield = champ?.querySelector('math-field') as
        (HTMLElement & { value: string }) | null
      if (champ == null || mathfield == null) return
      mathfield.value = valeur
      champ.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          composed: true,
        }),
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    let reste = Number(element.getAttribute('nombre'))
    const facteurs: number[] = []
    await saisis('4')
    for (let d = 2; reste > 1; d++) {
      while (reste % d === 0) {
        await saisis(String(d))
        reste /= d
        facteurs.push(d)
        await saisis(String(reste))
      }
    }
    const final = element.querySelector(
      '[data-dfp-final] math-field',
    ) as HTMLElement & { value: string }
    final.value = facteurs.join('\\times ')
    return JSON.stringify(element.value)
  }, decompositionTag)
  const decompositionScoreBefore = await decompositionResult()

  await page.goto(decompositionUrl)
  await page.waitForSelector(`${decompositionTag} math-field`)
  const decompositionAfter = await page.evaluate(
    async ({ selector, storedAnswer }) => {
      const element = document.querySelector(selector) as HTMLElement & {
        value: unknown
      }
      element.value = storedAnswer
      await new Promise((resolve) => setTimeout(resolve, 100))
      return JSON.stringify(element.value)
    },
    { selector: decompositionTag, storedAnswer: decompositionBefore },
  )
  const decompositionScoreAfter = await decompositionResult()

  expect(JSON.parse(decompositionBefore).etapes[0].diviseurs[0]).toEqual({
    v: '4',
    ok: false,
  })
  expect(decompositionAfter).toEqual(decompositionBefore)
  expect(decompositionScoreBefore.barres).toBeGreaterThan(0)
  expect(decompositionScoreAfter).toEqual(decompositionScoreBefore)
  return true
}

prefs.headless = true
runTest(testCustomElementsSerializedReplay, import.meta.url, {
  pauseOnError: false,
})
