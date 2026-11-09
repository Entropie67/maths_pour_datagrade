import { fonctionComparaison } from '../../../src/lib/interactif/comparisonFunctions'
import {
  isAnswerType,
  type IExercice,
  type OptionsComparaisonType,
} from '../../../src/lib/types'
import { toCompareInput, type VerificationResult } from './verifier-shared'

type CompositeCompareFunction = {
  kind?: string
}

function isCompositeCompareFunction(
  compareFunction: unknown,
): compareFunction is CompositeCompareFunction {
  return (
    typeof compareFunction === 'function' &&
    'kind' in compareFunction &&
    (compareFunction.kind === 'all' || compareFunction.kind === 'seq')
  )
}

function comparisonRequiresFullDom(
  compareFunction: Function,
  options: OptionsComparaisonType,
): string | undefined {
  if (
    options.ensembleDeNombres ||
    options.suiteDeNombres ||
    options.kUplet ||
    options.suiteRangeeDeNombres
  ) {
    return 'number-set-comparator-tested-by-full-dom'
  }
  if (compareFunction.name === 'comparePeriodicSets') {
    return 'periodic-set-comparator-tested-by-full-dom'
  }
  return undefined
}

function isPlaceholderLikeAnswer(value: string): boolean {
  return /^[\s{}\\,]*\.[\s{}\\,]*$/.test(value)
}

/**
 * Bypass DOM entirely: directly call the comparison function with the expected answer.
 * Tests that the comparison function accepts the exercise's own answer.
 */
export function verifyComparisonOnly(
  exercice: IExercice,
): VerificationResult[] {
  const results: VerificationResult[] = []

  for (let i = 0; i < exercice.autoCorrection.length; i++) {
    const ac = exercice.autoCorrection[i]
    const format = ac?.formatInteractif ?? 'mathlive'
    const valeur = ac?.valeur

    if (
      ![
        'mathlive',
        'texte',
        'fillInTheBlank',
        'tableauMathlive',
        'MetaInteractif2d',
        'multi-mathfield',
      ].includes(format)
    ) {
      results.push({
        questionIndex: i,
        format,
        verificationFunctionName: '',
        simulatedInput: '',
        goodAnswer: '',
        isOk: true,
        feedback: '',
        skipped: true,
        skipReason: `format-${format}-not-supported`,
      })
      continue
    }

    if (!valeur) {
      results.push({
        questionIndex: i,
        format,
        verificationFunctionName: 'not applicable',
        simulatedInput: '',
        goodAnswer: '',
        isOk: false,
        feedback: 'No valeur',
        skipped: true,
        skipReason: 'no-valeur',
      })
      continue
    }
    if (typeof valeur.callback === 'function') {
      results.push({
        questionIndex: i,
        format,
        verificationFunctionName: 'not applicable',
        simulatedInput: '',
        goodAnswer: '',
        isOk: true,
        feedback: '',
        skipped: true,
        skipReason: 'callback-based-verification',
      })
      continue
    }

    let allOk = true
    let failedField = ''
    let comparisonsExecuted = 0
    const simulatedInputs: string[] = []
    const goodAnswers: string[] = []
    let optionsComparaison: OptionsComparaisonType = {}
    const verificationFunctionNames = new Set<string>()
    let pushedSkipResult = false
    for (const [key, answer] of Object.entries(valeur)) {
      if (
        key === 'bareme' ||
        key === 'feedback' ||
        typeof answer === 'function'
      ) {
        continue
      }
      if (!isAnswerType(answer)) continue
      const compareFunction = answer.compare ?? fonctionComparaison
      verificationFunctionNames.add(compareFunction.name || 'anonymous')
      const options = answer.options ?? {}
      if (isCompositeCompareFunction(compareFunction)) {
        results.push({
          questionIndex: i,
          format,
          verificationFunctionName: compareFunction.kind,
          simulatedInput: '',
          goodAnswer: '',
          isOk: true,
          feedback: '',
          skipped: true,
          skipReason: 'composite-comparator-tested-by-full-dom',
        })
        pushedSkipResult = true
        comparisonsExecuted = 0
        allOk = true
        break
      }
      const fullDomSkipReason = comparisonRequiresFullDom(
        compareFunction,
        options,
      )
      if (fullDomSkipReason != null) {
        results.push({
          questionIndex: i,
          format,
          verificationFunctionName: compareFunction.name || 'anonymous',
          optionsComparaison: options,
          simulatedInput: '',
          goodAnswer: '',
          isOk: true,
          feedback: '',
          skipped: true,
          skipReason: fullDomSkipReason,
        })
        pushedSkipResult = true
        comparisonsExecuted = 0
        allOk = true
        break
      }

      const goodAnswer = Array.isArray(answer.value)
        ? String(answer.value[0])
        : String(answer.value)
      const simulatedInput = toCompareInput(goodAnswer, options)
      if (
        isPlaceholderLikeAnswer(goodAnswer) ||
        isPlaceholderLikeAnswer(simulatedInput) ||
        (format === 'fillInTheBlank' && goodAnswer.trim() === '')
      ) {
        results.push({
          questionIndex: i,
          format,
          verificationFunctionName: compareFunction.name || 'anonymous',
          optionsComparaison: options,
          simulatedInput: '',
          goodAnswer,
          isOk: true,
          feedback: '',
          skipped: true,
          skipReason:
            goodAnswer.trim() === ''
              ? 'empty-fill-in-the-blank-tested-by-full-dom'
              : 'placeholder-like-answer-tested-by-full-dom',
        })
        pushedSkipResult = true
        comparisonsExecuted = 0
        allOk = true
        break
      }
      // Champ d'une branche conditionnelle (data-show-when) : sa réponse attendue
      // vide signifie qu'il reste masqué, il n'y a rien à comparer.
      if (goodAnswer.trim() === '') continue
      optionsComparaison = { ...optionsComparaison, ...options }
      simulatedInputs.push(`${key}:${simulatedInput}`)
      goodAnswers.push(`${key}:${goodAnswer}`)
      try {
        const result = compareFunction(simulatedInput, goodAnswer, options)
        comparisonsExecuted += 1
        if (!result.isOk) {
          allOk = false
          failedField = key
        }
      } catch (e) {
        comparisonsExecuted += 1
        allOk = false
        failedField = `${key}(threw: ${e instanceof Error ? e.message : e})`
      }
    }

    if (pushedSkipResult) continue

    if (comparisonsExecuted === 0) {
      results.push({
        questionIndex: i,
        format,
        verificationFunctionName: 'not applicable',
        simulatedInput: '',
        goodAnswer: '',
        isOk: false,
        feedback: 'No compare function executed',
        skipped: true,
        skipReason: 'no-compare-function',
      })
      continue
    }

    results.push({
      questionIndex: i,
      format,
      verificationFunctionName: Array.from(verificationFunctionNames).join(','),
      optionsComparaison,
      simulatedInput: simulatedInputs.join(' | '),
      goodAnswer: goodAnswers.join(' | '),
      isOk: allOk,
      feedback: allOk ? '' : `Champ: ${failedField}`,
      skipped: false,
    })
  }

  return results
}
