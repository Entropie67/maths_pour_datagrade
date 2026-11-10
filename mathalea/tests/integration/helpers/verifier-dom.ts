import ListeDeroulanteElement from '../../../src/lib/customElements/ListeDeroulanteElement'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../../../src/lib/customElements/MathaleaCustomElement'
import { MultiMathfieldElement } from '../../../src/lib/customElements/MultiMathfield'
import { MySpreadsheetElement } from '../../../src/lib/customElements/MySpreadSheet'
import { SvgSelectionElement } from '../../../src/lib/customElements/SvgSelectionElement'
import { verifQuestionCliqueFigure } from '../../../src/lib/customElements/CliqueFigureElement'
import { DragAndDropElement } from '../../../src/lib/customElements/DragAndDropElement'
import { MetaInteractif2dElement } from '../../../src/lib/customElements/MetaInteractif2dElement'
import type { AutoCorrection, IExercice } from '../../../src/lib/types'
import { interactivityTypeToCustomElementFormat } from '../../../src/lib/types'
import {
  injectCliqueFigureDOM,
  injectCustomMathPromptDOM,
  injectDndDOM,
  injectFillInTheBlankDOM,
  injectInteractiveClockDOM,
  injectListeDeroulanteDOM,
  injectMathLiveDOM,
  injectMetaInteractif2dDOM,
  injectMultiMathfieldDOM,
  injectQcmDOM,
  injectSvgSelectionDOM,
  injectTableauMathliveDOM,
  injectTableurDOM,
} from './domSimulator'
import {
  ensureDragAndDropQuestion,
  extractClockValuesForCustom,
  extractPromptValuesForCallbackQuestion,
  extractPromptValuesForCustom,
  grandeurStringToLatex,
  normalizeCustomCorrectionResult,
  toCompareInput,
  toDndValeur,
  type VerificationResult,
} from './verifier-shared'

type CliqueFigureItem = { id: string; solution: boolean }

function isCliqueFigureItem(value: unknown): value is CliqueFigureItem {
  if (typeof value !== 'object' || value == null) return false
  const candidate: Partial<CliqueFigureItem> = value
  return (
    typeof candidate.id === 'string' && typeof candidate.solution === 'boolean'
  )
}

function stringifyRecord(values: Record<string, string>): string {
  return Object.entries(values)
    .map(([key, value]) => `${key}:${value}`)
    .join(' | ')
}

function stringifyDndValeur(value: ReturnType<typeof toDndValeur>): string {
  return Object.entries(value)
    .map(([key, answer]) => {
      const rawValue = answer.value
      const normalizedValue = Array.isArray(rawValue)
        ? rawValue.join(',')
        : String(rawValue ?? '')
      const multi = answer.options?.multi === true ? 'multi' : 'single'
      return `${key}:${normalizedValue}(${multi})`
    })
    .join(' | ')
}

function stringifyQcmSelections(
  propositions: { statut?: boolean | number | string }[],
): string {
  const selected = propositions
    .map((prop, index) => (prop.statut ? `R${index}` : null))
    .filter((value): value is string => value != null)
  return selected.join(',')
}

function verifyCustomQuestion(
  exercice: IExercice,
  questionIndex: number,
  ac: AutoCorrection | undefined,
): VerificationResult {
  if (typeof exercice.correctionInteractive !== 'function') {
    return {
      questionIndex,
      format: 'custom',
      verificationFunctionName: '',
      simulatedInput: '',
      goodAnswer: '',
      isOk: true,
      feedback: '',
      skipped: true,
      skipReason: 'custom-no-correction-interactive',
    }
  }

  const exIdx = exercice.numeroExercice ?? 0
  const promptValues = extractPromptValuesForCustom(ac)
  if (Object.keys(promptValues).length > 0) {
    injectCustomMathPromptDOM(exIdx, questionIndex, promptValues)
    const inputId = `champTexteEx${exIdx}Q${questionIndex}`
    const expectedSelector = `math-field#${inputId}`
    const originalQuerySelector = document.querySelector.bind(document)
    document.querySelector = (selectors: string) => {
      if (selectors === expectedSelector) {
        return document.getElementById(inputId)
      }
      return originalQuerySelector(selectors)
    }
    let result: string | string[]
    try {
      result = exercice.correctionInteractive(questionIndex)
    } finally {
      document.querySelector = originalQuerySelector
    }
    const isOk = normalizeCustomCorrectionResult(result)
    return {
      questionIndex,
      format: 'custom',
      verificationFunctionName: 'correctionInteractive',
      simulatedInput: stringifyRecord(promptValues),
      goodAnswer: stringifyRecord(promptValues),
      isOk,
      feedback: isOk ? '' : 'custom correctionInteractive returned KO',
      skipped: false,
    }
  }

  const clockValues = extractClockValuesForCustom(ac)
  const questionText = exercice.listeQuestions[questionIndex] ?? ''
  if (clockValues != null && questionText.includes('interactive-clockEx')) {
    const rawHour = Number.parseInt(clockValues.hour, 10)
    const domHour = Number.isNaN(rawHour)
      ? clockValues.hour
      : rawHour > 12
        ? String(rawHour - 12)
        : String(rawHour)

    injectInteractiveClockDOM(exIdx, questionIndex, domHour, clockValues.minute)
    const result = exercice.correctionInteractive(questionIndex)
    const isOk = normalizeCustomCorrectionResult(result)
    const clockAnswer = `${clockValues.hour}h${clockValues.minute}`
    return {
      questionIndex,
      format: 'custom',
      verificationFunctionName: 'correctionInteractive',
      simulatedInput: clockAnswer,
      goodAnswer: clockAnswer,
      isOk,
      feedback: isOk ? '' : 'custom correctionInteractive returned KO',
      skipped: false,
    }
  }

  return {
    questionIndex,
    format: 'custom',
    verificationFunctionName: 'correctionInteractive',
    simulatedInput: '',
    goodAnswer: '',
    isOk: true,
    feedback: '',
    skipped: true,
    skipReason: 'custom-no-adapter',
  }
}

function verifyCustomElementQuestion(
  exercice: IExercice,
  questionIndex: number,
  format: string,
) {
  const customElementFormat =
    interactivityTypeToCustomElementFormat(format) ?? format
  if (!listOfCustomElements.includes(customElementFormat)) {
    throw Error(`Format custom element inconnu: ${format}`)
  }
  const [, elementClasse] =
    Array.from(mathaleaCustomElementsRegistry).find(
      (custom) => custom[0] === customElementFormat,
    ) ?? []
  if (elementClasse == null) {
    throw Error(
      `Classe de custom element non enregistrée pour le format ${customElementFormat}`,
    )
  }
  return {
    name: `${elementClasse.name}.verifQuestion`,
    result: elementClasse.verifQuestion(exercice, questionIndex),
  }
}

/**
 * Verifies all questions of an exercise by:
 * 1. Reading autoCorrection to get expected answers
 * 2. Injecting the correct answer into fake DOM
 * 3. Calling the real verification function
 * 4. Checking the result
 */
export function verifyDom(exercice: IExercice): VerificationResult[] {
  const results: VerificationResult[] = []

  for (let i = 0; i < exercice.autoCorrection.length; i++) {
    const ac = exercice.autoCorrection[i]
    const format = ac?.reponse?.param?.formatInteractif ?? 'mathlive'
    const valeur = ac?.reponse?.valeur
    const exIdx = exercice.numeroExercice ?? 0

    try {
      switch (format) {
        case 'mathlive':
        case 'texte': {
          if (
            valeur?.callback != null &&
            typeof valeur.callback === 'function'
          ) {
            const promptValues = extractPromptValuesForCallbackQuestion(
              exercice,
              i,
              ac,
            )
            if (Object.keys(promptValues).length === 0) {
              results.push({
                questionIndex: i,
                format,
                verificationFunctionName: 'MathaleaCustomElement.verifQuestion',
                simulatedInput: '',
                goodAnswer: '',
                isOk: true,
                feedback: '',
                skipped: true,
                skipReason: 'callback-no-adapter',
              })
              break
            }
            injectCustomMathPromptDOM(exIdx, i, promptValues)
            const { name, result } = verifyCustomElementQuestion(
              exercice,
              i,
              format,
            )
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: name,
              simulatedInput: stringifyRecord(promptValues),
              goodAnswer: stringifyRecord(promptValues),
              isOk: result?.isOk === true,
              feedback: result?.feedback ?? '',
              skipped: false,
            })
            break
          }
          const answer = valeur?.reponse?.value
          if (answer == null) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'MathaleaCustomElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No answer value found',
              skipped: true,
              skipReason: 'no-answer-value',
            })
            break
          }
          const rawAnswer = Array.isArray(answer)
            ? String(answer[0])
            : String(answer)
          const options = valeur?.reponse?.options ?? {}
          const answerStr = toCompareInput(rawAnswer, options)
          injectMathLiveDOM(exIdx, i, answerStr)
          const { name, result } = verifyCustomElementQuestion(
            exercice,
            i,
            format,
          )
          results.push({
            questionIndex: i,
            format,
            verificationFunctionName: name,
            simulatedInput: answerStr,
            goodAnswer: rawAnswer,
            isOk: result?.isOk === true,
            feedback: result?.feedback ?? '',
            skipped: false,
          })
          break
        }

        case 'fillInTheBlank': {
          if (!valeur) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'MathaleaCustomElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No valeur',
              skipped: true,
              skipReason: 'no-valeur',
            })
            break
          }
          const champValues: Record<string, string> = {}
          for (const [key, answer] of Object.entries(valeur)) {
            if (key.startsWith('champ') && answer?.value != null) {
              const val = answer.value
              const raw = Array.isArray(val) ? String(val[0]) : String(val)
              const opts = answer.options ?? {}
              champValues[key] = opts.unite ? grandeurStringToLatex(raw) : raw
            }
          }
          if (Object.keys(champValues).length === 0) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'MathaleaCustomElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No champ values',
              skipped: true,
              skipReason: 'no-champ-values',
            })
            break
          }
          injectFillInTheBlankDOM(exIdx, i, champValues)
          const { name, result } = verifyCustomElementQuestion(
            exercice,
            i,
            format,
          )
          results.push({
            questionIndex: i,
            format,
            verificationFunctionName: name,
            simulatedInput: stringifyRecord(champValues),
            goodAnswer: stringifyRecord(champValues),
            isOk: result?.isOk === true,
            feedback: result?.feedback ?? '',
            skipped: false,
          })
          break
        }

        case 'tableauMathlive': {
          if (!valeur) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'MathaleaCustomElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No valeur',
              skipped: true,
              skipReason: 'no-valeur',
            })
            break
          }
          const cellValues: Record<string, string> = {}
          for (const [key, answer] of Object.entries(valeur)) {
            if (key.match(/^L\d+C\d+$/) && answer?.value != null) {
              const val = answer.value
              const raw = Array.isArray(val) ? String(val[0]) : String(val)
              const opts = answer.options ?? {}
              cellValues[key] = opts.unite ? grandeurStringToLatex(raw) : raw
            }
          }
          if (Object.keys(cellValues).length === 0) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'MathaleaCustomElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No cell values',
              skipped: true,
              skipReason: 'no-cell-values',
            })
            break
          }
          injectTableauMathliveDOM(exIdx, i, cellValues)
          const { name, result } = verifyCustomElementQuestion(
            exercice,
            i,
            format,
          )
          results.push({
            questionIndex: i,
            format,
            verificationFunctionName: name,
            simulatedInput: stringifyRecord(cellValues),
            goodAnswer: stringifyRecord(cellValues),
            isOk: result?.isOk === true,
            feedback: result?.feedback ?? '',
            skipped: false,
          })
          break
        }

        case 'qcm': {
          const propositions = ac.propositions
          if (!propositions || propositions.length === 0) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'verifQuestionQcm',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No propositions',
              skipped: true,
              skipReason: 'no-propositions',
            })
            break
          }
          injectQcmDOM(exIdx, i, propositions)
          const { name, result } = verifyCustomElementQuestion(
            exercice,
            i,
            format,
          )
          const qcmSelections = stringifyQcmSelections(propositions)
          results.push({
            questionIndex: i,
            format,
            verificationFunctionName: name,
            simulatedInput: qcmSelections,
            goodAnswer: qcmSelections,
            isOk: result.isOk,
            feedback: '',
            skipped: false,
          })
          break
        }

        case 'liste-deroulante': {
          const dropdownAnswer = valeur?.reponse?.value
          if (dropdownAnswer == null) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'ListeDeroulanteElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No dropdown value',
              skipped: true,
              skipReason: 'no-dropdown-value',
            })
            break
          }
          const answerStr = Array.isArray(dropdownAnswer)
            ? String(dropdownAnswer[0])
            : String(dropdownAnswer)
          injectListeDeroulanteDOM(exIdx, i, answerStr)
          const result = ListeDeroulanteElement.verifQuestion(exercice, i)
          results.push({
            questionIndex: i,
            format,
            verificationFunctionName: 'ListeDeroulanteElement.verifQuestion',
            simulatedInput: answerStr,
            goodAnswer: answerStr,
            isOk: result.isOk,
            feedback: '',
            skipped: false,
          })
          break
        }

        case 'svg-selection': {
          const selectionValue = valeur?.reponse?.value
          if (selectionValue == null) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'SvgSelectionElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No svg-selection value',
              skipped: true,
              skipReason: 'no-svg-selection-value',
            })
            break
          }
          const answerStr = Array.isArray(selectionValue)
            ? String(selectionValue[0])
            : String(selectionValue)
          injectSvgSelectionDOM(exIdx, i, answerStr)
          const result = SvgSelectionElement.verifQuestion(exercice, i)
          results.push({
            questionIndex: i,
            format,
            verificationFunctionName: 'SvgSelectionElement.verifQuestion',
            simulatedInput: answerStr,
            goodAnswer: answerStr,
            isOk: result.isOk,
            feedback: '',
            skipped: false,
          })
          break
        }

        case 'MetaInteractif2d': {
          if (!valeur) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'MetaInteractif2dElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No valeur',
              skipped: true,
              skipReason: 'no-valeur',
            })
            break
          }
          const fieldValues: Record<string, string> = {}
          for (const [key, answer] of Object.entries(valeur)) {
            if (key.match(/^field\d+$/) && answer?.value != null) {
              const val = answer.value
              const raw = Array.isArray(val) ? String(val[0]) : String(val)
              const opts = answer.options ?? {}
              fieldValues[key] = opts.unite ? grandeurStringToLatex(raw) : raw
            }
          }
          if (Object.keys(fieldValues).length === 0) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'MetaInteractif2dElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No field values',
              skipped: true,
              skipReason: 'no-field-values',
            })
            break
          }
          injectMetaInteractif2dDOM(exIdx, i, fieldValues)
          const result = MetaInteractif2dElement.verifQuestion(exercice, i)
          results.push({
            questionIndex: i,
            format,
            verificationFunctionName: 'MetaInteractif2dElement.verifQuestion',
            simulatedInput: stringifyRecord(fieldValues),
            goodAnswer: stringifyRecord(fieldValues),
            isOk: result?.isOk === true,
            feedback: result?.feedback ?? '',
            skipped: false,
          })
          break
        }

        case 'multi-mathfield': {
          if (!valeur) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'MultiMathfieldElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No valeur',
              skipped: true,
              skipReason: 'no-valeur',
            })
            break
          }
          const fieldValues: Record<string, string> = {}
          for (const [key, answer] of Object.entries(valeur)) {
            if (key === 'bareme' || key === 'feedback' || !answer?.value) {
              continue
            }
            const val = answer.value
            const options = answer.options ?? {}
            const raw = Array.isArray(val) ? String(val[0]) : String(val)

            const opts = answer.options ?? {}
            fieldValues[key] = opts.unite
              ? grandeurStringToLatex(raw)
              : toCompareInput(raw, options)
          }
          if (Object.keys(fieldValues).length === 0) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'MultiMathfieldElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No field values',
              skipped: true,
              skipReason: 'no-field-values',
            })
            break
          }
          injectMultiMathfieldDOM(exIdx, i, fieldValues)
          const result = MultiMathfieldElement.verifQuestion(exercice, i)
          results.push({
            questionIndex: i,
            format,
            verificationFunctionName: 'MultiMathfieldElement.verifQuestion',
            simulatedInput: stringifyRecord(fieldValues),
            goodAnswer: stringifyRecord(fieldValues),
            isOk: result?.isOk === true,
            feedback: result?.feedback ?? '',
            skipped: false,
          })
          break
        }

        case 'cliqueFigure': {
          if (
            exercice.cliqueFiguresArray == null ||
            !Array.isArray(exercice.cliqueFiguresArray[i])
          ) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'verifQuestionCliqueFigure',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No cliqueFigure figures',
              skipped: true,
              skipReason: 'no-figures',
            })
            break
          }

          const figures: CliqueFigureItem[] = []
          for (const candidate of exercice.cliqueFiguresArray[i] as unknown[]) {
            if (isCliqueFigureItem(candidate)) {
              figures.push(candidate)
            }
          }
          if (figures.length === 0) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'verifQuestionCliqueFigure',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No cliqueFigure figures',
              skipped: true,
              skipReason: 'no-figures',
            })
            break
          }

          injectCliqueFigureDOM(exIdx, i, figures)
          if (
            'callback' in exercice &&
            typeof exercice.callback === 'function'
          ) {
            exercice.callback(exercice, i)
          }
          const result = verifQuestionCliqueFigure(exercice, i)
          const figuresState = figures
            .map((figure) => `${figure.id}:${String(figure.solution)}`)
            .join(' | ')
          results.push({
            questionIndex: i,
            format,
            verificationFunctionName: 'verifQuestionCliqueFigure',
            simulatedInput: figuresState,
            goodAnswer: figuresState,
            isOk: result === 'OK',
            feedback: '',
            skipped: false,
          })
          break
        }

        case 'dnd': {
          if (!valeur) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'verifDragAndDrop',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No valeur',
              skipped: true,
              skipReason: 'no-valeur',
            })
            break
          }
          const dndValeur = toDndValeur(valeur)
          injectDndDOM(exIdx, i, dndValeur)
          ensureDragAndDropQuestion(exercice, i)
          const result = DragAndDropElement.verifQuestion(exercice, i)
          const dndAnswer = stringifyDndValeur(dndValeur)
          results.push({
            questionIndex: i,
            format,
            verificationFunctionName: 'DragAndDropElement.verifQuestion',
            simulatedInput: dndAnswer,
            goodAnswer: dndAnswer,
            isOk: result?.isOk === true,
            feedback: result?.feedback ?? '',
            skipped: false,
          })
          break
        }

        case 'my-spreadsheet': {
          const sheetAnswer = valeur?.sheetAnswer
          if (!sheetAnswer) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'MySpreadsheetElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'No sheetAnswer',
              skipped: true,
              skipReason: 'no-sheet-answer',
            })
            break
          }
          const goodAnswers = sheetAnswer.goodAnswerFormulas
          const testDatas = sheetAnswer.sheetTestDatas
          if (!Array.isArray(goodAnswers) || !Array.isArray(testDatas)) {
            results.push({
              questionIndex: i,
              format,
              verificationFunctionName: 'MySpreadsheetElement.verifQuestion',
              simulatedInput: '',
              goodAnswer: '',
              isOk: false,
              feedback: 'Invalid tableur test data',
              skipped: true,
              skipReason: 'invalid-sheet-answer-data',
            })
            break
          }

          injectTableurDOM(exIdx, i, goodAnswers, testDatas)
          const result = MySpreadsheetElement.verifQuestion(exercice, i)
          results.push({
            questionIndex: i,
            format,
            verificationFunctionName: 'MySpreadsheetElement.verifQuestion',
            simulatedInput: JSON.stringify(goodAnswers),
            goodAnswer: JSON.stringify(goodAnswers),
            isOk: result?.isOk === true,
            feedback: result?.feedback ?? '',
            skipped: false,
          })
          break
        }

        case 'custom':
          results.push(verifyCustomQuestion(exercice, i, ac))
          break

        default:
          results.push({
            questionIndex: i,
            format: format ?? 'unknown',
            verificationFunctionName: 'unknown',
            simulatedInput: '',
            goodAnswer: '',
            isOk: false,
            feedback: `Unknown format: ${format}`,
            skipped: true,
            skipReason: 'unknown-format',
          })
      }
    } catch (error) {
      results.push({
        questionIndex: i,
        format,
        verificationFunctionName: 'error',
        simulatedInput: '',
        goodAnswer: '',
        isOk: false,
        feedback: error instanceof Error ? error.message : String(error),
        skipped: false,
      })
    }
  }

  return results
}
