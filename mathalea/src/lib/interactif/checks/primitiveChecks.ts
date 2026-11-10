import { compile } from '@cortex-js/compute-engine'
import { generateCleaner } from '../cleaners'
import type { Check, CheckOverrides } from './types'

/**
 * Checks pour les exercices de primitives : comparaison de fonctions à une
 * constante additive près, présence ou absence de la constante d'intégration
 * et diagnostic d'un terme constant erroné (condition initiale).
 * La comparaison est numérique, par échantillonnage sur un intervalle inclus
 * dans le domaine de définition de la fonction attendue.
 * @author Nathan Scheinmann
 */

const cleanLatex = generateCleaner([
  'virgules',
  'parentheses',
  'fractions',
  'divisions',
])

const RELATIVE_TOLERANCE = 1e-6
const MIN_SAMPLES = 6
const MAX_TRIES = 400

type NumericFunction = (vars: Record<string, number>) => number

function compileLatexFunction(latex: string): NumericFunction | null {
  try {
    const compiled = compile(cleanLatex(latex))
    if (compiled?.run == null) return null
    return (vars) => {
      try {
        const value = compiled.run!(vars)
        return typeof value === 'number' ? value : Number.NaN
      } catch {
        return Number.NaN
      }
    }
  } catch {
    return null
  }
}

/** Détecte une variable isolée (non précédée de \ et hors d'un mot comme \cos) */
function standaloneVariableRegex(variable: string) {
  return new RegExp(`(?<![a-zA-Z\\\\])${variable}(?![a-zA-Z])`)
}

type DifferenceVerdict = 'egal' | 'constante' | 'different' | 'indetermine'

type SamplingOptions = {
  variable?: string
  extraVars?: Record<string, number>
  domaine?: [number, number]
}

/**
 * Compare f et g par échantillonnage : « egal » si f=g, « constante » si f-g
 * est une constante non nulle, « indetermine » si trop peu de points valides.
 */
function verdictDifference(
  f: NumericFunction,
  g: NumericFunction,
  { variable = 'x', extraVars = {}, domaine = [-3, 3] }: SamplingOptions = {},
): DifferenceVerdict {
  const [min, max] = domaine
  const samples: { difference: number; scale: number }[] = []
  // Points où une seule des deux fonctions est définie : elles ne coïncident pas sur l'intervalle.
  let definieUneSeule = 0
  for (let i = 0; i < MAX_TRIES && samples.length < 12; i++) {
    const x = min + (max - min) * Math.random()
    const vars = { [variable]: x, ...extraVars }
    const yF = f(vars)
    const yG = g(vars)
    const finieF = Number.isFinite(yF)
    const finieG = Number.isFinite(yG)
    if (finieF !== finieG) {
      definieUneSeule++
      continue
    }
    if (!finieF) continue
    const scale = Math.max(1, Math.abs(yF), Math.abs(yG))
    if (scale > 1e6) continue
    samples.push({ difference: yF - yG, scale })
  }
  // Aucune valeur commune : la saisie n'est pas évaluable (variable inconnue, syntaxe…).
  if (samples.length === 0) return 'indetermine'
  if (definieUneSeule > 0) return 'different'
  if (samples.length < MIN_SAMPLES) return 'indetermine'
  if (
    samples.every(
      (s) => Math.abs(s.difference) <= RELATIVE_TOLERANCE * s.scale,
    )
  ) {
    return 'egal'
  }
  const reference = samples[0]
  const estConstante = samples.every(
    (s) =>
      Math.abs(s.difference - reference.difference) <=
      RELATIVE_TOLERANCE * Math.max(s.scale, reference.scale),
  )
  return estConstante ? 'constante' : 'different'
}

const FEEDBACK_NON_EVALUABLE =
  "La réponse saisie n'a pas pu être interprétée comme une fonction de $x$."

export type IntegrationConstantOptions = CheckOverrides & {
  /** Nom de la constante d'intégration (défaut : c) */
  constant?: string
  /** true : la constante doit être présente ; false : elle doit être absente */
  expected?: boolean
}

/**
 * Vérifie la présence (ou l'absence) de la constante d'intégration dans la saisie.
 */
export function integrationConstantPresence({
  constant = 'c',
  expected = true,
  ...overrides
}: IntegrationConstantOptions = {}): Check {
  return {
    name: overrides.name ?? 'integration-constant-presence',
    weight: overrides.weight,
    feedbackEnabled: overrides.feedbackEnabled,
    feedbackOnSuccess: overrides.feedbackOnSuccess,
    run: (saisie: string) => {
      const present = standaloneVariableRegex(constant).test(saisie)
      return {
        passed: present === expected,
        feedbackKo:
          overrides.feedbackKo ??
          (expected
            ? `Il manque la constante d'intégration $+${constant}$.`
            : `La réponse ne doit pas contenir la constante $${constant}$.`),
        feedbackOk: overrides.feedbackOk,
      }
    },
  }
}

export type PrimitiveComparisonOptions = CheckOverrides & {
  /** Nom de la constante d'intégration (défaut : c) */
  constant?: string
  /** Variable de la fonction (défaut : x) */
  variable?: string
  /** Intervalle d'échantillonnage, inclus dans le domaine de la réponse attendue */
  domaine?: [number, number]
  /** Exige que la saisie dépende effectivement de la constante */
  requireConstantEffect?: boolean
}

/**
 * Vérifie que la saisie et la réponse attendue ont la même dérivée sur
 * l'intervalle : leur différence doit être constante. Toute primitive
 * correcte est donc acceptée, quelle que soit sa constante.
 */
export function samePrimitiveUpToConstant({
  constant = 'c',
  variable = 'x',
  domaine = [-3, 3],
  requireConstantEffect = false,
  ...overrides
}: PrimitiveComparisonOptions = {}): Check {
  return {
    name: overrides.name ?? 'same-primitive-up-to-constant',
    weight: overrides.weight,
    feedbackEnabled: overrides.feedbackEnabled,
    feedbackOnSuccess: overrides.feedbackOnSuccess,
    run: (saisie: string, answer: string) => {
      const saisieFn = compileLatexFunction(saisie)
      const answerFn = compileLatexFunction(answer)
      if (saisieFn == null || answerFn == null) {
        return { passed: false, feedbackKo: FEEDBACK_NON_EVALUABLE }
      }
      const constantValue = 0.4211
      const verdict = verdictDifference(saisieFn, answerFn, {
        variable,
        extraVars: { [constant]: constantValue },
        domaine,
      })
      if (verdict === 'indetermine') {
        return { passed: false, feedbackKo: FEEDBACK_NON_EVALUABLE }
      }
      if (verdict === 'different') {
        return {
          passed: false,
          feedbackKo:
            overrides.feedbackKo ??
            'En dérivant la réponse saisie, on ne retrouve pas la fonction donnée.',
        }
      }
      if (requireConstantEffect) {
        const avecCNul: NumericFunction = (vars) =>
          saisieFn({ ...vars, [constant]: 0 })
        const avecCUn: NumericFunction = (vars) =>
          saisieFn({ ...vars, [constant]: 1 })
        const dependance = verdictDifference(avecCNul, avecCUn, {
          variable,
          domaine,
        })
        if (dependance === 'egal') {
          return {
            passed: false,
            feedbackKo: `La constante $${constant}$ doit apparaître dans la réponse : il y a une infinité de solutions.`,
          }
        }
      }
      return { passed: true, feedbackKo: '', feedbackOk: overrides.feedbackOk }
    },
  }
}

/**
 * Vérifie l'égalité des fonctions sur l'intervalle. Si la saisie ne diffère
 * de la réponse attendue que d'une constante non nulle, le feedback signale
 * que le terme constant ne vérifie pas la condition demandée.
 */
export function sameFunctionWithConstantFeedback({
  variable = 'x',
  domaine = [-3, 3],
  ...overrides
}: PrimitiveComparisonOptions = {}): Check {
  return {
    name: overrides.name ?? 'same-function-with-constant-feedback',
    weight: overrides.weight,
    feedbackEnabled: overrides.feedbackEnabled,
    feedbackOnSuccess: overrides.feedbackOnSuccess,
    run: (saisie: string, answer: string) => {
      const saisieFn = compileLatexFunction(saisie)
      const answerFn = compileLatexFunction(answer)
      if (saisieFn == null || answerFn == null) {
        return { passed: false, feedbackKo: FEEDBACK_NON_EVALUABLE }
      }
      const verdict = verdictDifference(saisieFn, answerFn, {
        variable,
        domaine,
      })
      if (verdict === 'egal') {
        return {
          passed: true,
          feedbackKo: '',
          feedbackOk: overrides.feedbackOk,
        }
      }
      if (verdict === 'constante') {
        return {
          passed: false,
          feedbackKo:
            overrides.feedbackKo ??
            'La fonction saisie a la bonne dérivée, mais son terme constant ne vérifie pas la condition demandée.',
        }
      }
      return {
        passed: false,
        feedbackKo:
          verdict === 'indetermine'
            ? FEEDBACK_NON_EVALUABLE
            : 'En dérivant la réponse saisie, on ne retrouve pas la fonction donnée.',
      }
    },
  }
}

export type SameFunctionOptions = CheckOverrides & {
  /** Variable de la fonction (défaut : x) */
  variable?: string
  /** Intervalle d'échantillonnage, inclus dans le domaine de la réponse attendue */
  domaine?: [number, number]
}

/**
 * Vérifie l'égalité de deux fonctions sur l'intervalle, par échantillonnage :
 * toute écriture de la fonction attendue est acceptée (dérivée non simplifiée,
 * forme factorisée ou développée…).
 */
export function sameFunction({
  variable = 'x',
  domaine = [-3, 3],
  ...overrides
}: SameFunctionOptions = {}): Check {
  return {
    name: overrides.name ?? 'same-function',
    weight: overrides.weight,
    feedbackEnabled: overrides.feedbackEnabled,
    feedbackOnSuccess: overrides.feedbackOnSuccess,
    run: (saisie: string, answer: string) => {
      const saisieFn = compileLatexFunction(saisie)
      const answerFn = compileLatexFunction(answer)
      if (saisieFn == null || answerFn == null) {
        return { passed: false, feedbackKo: FEEDBACK_NON_EVALUABLE }
      }
      const verdict = verdictDifference(saisieFn, answerFn, {
        variable,
        domaine,
      })
      if (verdict === 'indetermine') {
        return { passed: false, feedbackKo: FEEDBACK_NON_EVALUABLE }
      }
      return {
        passed: verdict === 'egal',
        feedbackKo:
          overrides.feedbackKo ??
          "Cette fonction n'est pas égale à la fonction attendue.",
        feedbackOk: overrides.feedbackOk,
      }
    },
  }
}
