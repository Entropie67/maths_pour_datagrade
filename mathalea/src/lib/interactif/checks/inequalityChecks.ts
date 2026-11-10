import { compile } from '@cortex-js/compute-engine'
import {
  insertImplicitProducts,
  normalizeLatexArithmetic,
} from './latexArithmetic'
import type { Check, CheckOverrides } from './types'

type Relation = '<' | '<=' | '>' | '>='
type Inequality = { left: string; relation: Relation; right: string }

const tolerance = 1e-8

function normalizeRelation(value: string): string {
  return value
    .replaceAll('\\leqslant', '<=')
    .replaceAll('\\geqslant', '>=')
    .replaceAll('\\leq', '<=')
    .replaceAll('\\geq', '>=')
    .replaceAll('\\le', '<=')
    .replaceAll('\\ge', '>=')
    .replaceAll('≤', '<=')
    .replaceAll('≥', '>=')
}

export function splitInequality(value: string): Inequality | undefined {
  const normalized = normalizeRelation(value)
  const matches = [...normalized.matchAll(/<=|>=|<|>/g)]
  if (matches.length !== 1 || matches[0].index == null) return undefined
  const relation = matches[0][0] as Relation
  const index = matches[0].index
  const left = normalized.slice(0, index).trim()
  const right = normalized.slice(index + relation.length).trim()
  if (left === '' || right === '') return undefined
  return { left, relation, right }
}

function normalizedExpression(value: string): string {
  return insertImplicitProducts(normalizeLatexArithmetic(value))
}

function variablesIn(value: string): string[] {
  return [...new Set(value.replace(/\\[a-z]+/gi, '').match(/[a-z]/gi) ?? [])]
}

function evaluate(value: string, point: Record<string, number>): number | null {
  const compiled = compile(normalizedExpression(value))
  if (compiled?.run == null) return null
  try {
    const result = compiled.run(point)
    return typeof result === 'number' && Number.isFinite(result) ? result : null
  } catch {
    return null
  }
}

function differenceAt(
  inequality: Inequality,
  point: Record<string, number>,
): number | null {
  const left = evaluate(inequality.left, point)
  const right = evaluate(inequality.right, point)
  return left == null || right == null ? null : left - right
}

function reverse(relation: Relation): Relation {
  return ({ '<': '>', '<=': '>=', '>': '<', '>=': '<=' } as const)[relation]
}

function areEquivalent(input: Inequality, answer: Inequality): boolean {
  const variables = [
    ...new Set([
      ...variablesIn(input.left),
      ...variablesIn(input.right),
      ...variablesIn(answer.left),
      ...variablesIn(answer.right),
    ]),
  ].sort()
  const points = Array.from(
    { length: Math.max(8, variables.length * 3) },
    (_, i) =>
      Object.fromEntries(
        variables.map((variable, j) => [variable, ((i + 2 * j) % 7) - 3]),
      ),
  )
  let ratio: number | undefined
  for (const point of points) {
    const inputValue = differenceAt(input, point)
    const answerValue = differenceAt(answer, point)
    if (inputValue == null || answerValue == null) return false
    if (Math.abs(answerValue) <= tolerance) {
      if (Math.abs(inputValue) > tolerance) return false
      continue
    }
    const currentRatio = inputValue / answerValue
    if (Math.abs(currentRatio) <= tolerance) return false
    if (ratio == null) ratio = currentRatio
    else if (Math.abs(currentRatio - ratio) > tolerance) return false
  }
  if (ratio == null) return false
  const expectedRelation =
    ratio < 0 ? reverse(answer.relation) : answer.relation
  return input.relation === expectedRelation
}

export function isEquivalentInequality(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'isEquivalentInequality',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    run: (input, answer) => {
      const parsedInput = splitInequality(input)
      const parsedAnswer = splitInequality(answer)
      const passed =
        parsedInput != null &&
        parsedAnswer != null &&
        areEquivalent(parsedInput, parsedAnswer)
      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          "L'inéquation saisie n'est pas équivalente à l'inéquation précédente.",
        feedbackOk:
          options.feedbackOk ??
          "L'inéquation saisie est équivalente à l'inéquation précédente.",
      }
    },
  }
}

type Bound = { value: number; strict: boolean; tex: string }
type IntervalCondition = { inf?: Bound; sup?: Bound }
type ParsedCondition = IntervalCondition | 'unreadable' | 'mixedDirections'

function parseBound(value: string): number | null {
  const cleaned = value.replaceAll('{,}', '.')
  if (/^\+?\\infty$/.test(cleaned)) return Infinity
  if (/^-\\infty$/.test(cleaned)) return -Infinity
  if (/[a-z]/i.test(cleaned.replace(/\\[a-z]+/gi, ''))) return null
  return evaluate(cleaned, {})
}

// Lit une inégalité (x<5, 3\leqslant x) ou un encadrement (-3<x\leqslant 5)
// portant sur `variable`, et la ramène à des bornes inférieure et supérieure.
function parseIntervalCondition(
  value: string,
  variable: string,
): ParsedCondition {
  const normalized = normalizeRelation(
    value
      .replaceAll('$', '')
      .replaceAll('\\left', '')
      .replaceAll('\\right', '')
      .replaceAll('\\,', '')
      .replaceAll('\\lt', '<')
      .replaceAll('\\gt', '>')
      .replaceAll('⩽', '≤')
      .replaceAll('⩾', '≥')
      .replace(/\s+/g, ''),
  )
  const relations = [...normalized.matchAll(/<=|>=|<|>/g)].map(
    (match) => match[0] as Relation,
  )
  const members = normalized.split(/<=|>=|<|>/)
  if (relations.length < 1 || relations.length > 2) return 'unreadable'
  if (members.some((member) => member === '')) return 'unreadable'

  const variableIndex = members.indexOf(variable)
  if (variableIndex === -1) return 'unreadable'
  if (relations.length === 2 && variableIndex !== 1) return 'unreadable'
  const isIncreasing = (relation: Relation) => relation.startsWith('<')
  if (
    relations.length === 2 &&
    isIncreasing(relations[0]) !== isIncreasing(relations[1])
  )
    return 'mixedDirections'

  const condition: IntervalCondition = {}
  for (const [index, member] of members.entries()) {
    if (index === variableIndex) continue
    const bound = parseBound(member)
    if (bound == null) return 'unreadable'
    const relation =
      index < variableIndex ? relations[index] : reverse(relations[index - 1])
    // relation se lit maintenant « member relation x »
    const isLower = isIncreasing(relation)
    if ((isLower && bound === Infinity) || (!isLower && bound === -Infinity))
      return 'unreadable'
    if (Math.abs(bound) === Infinity) continue
    const side = isLower ? 'inf' : 'sup'
    if (condition[side] != null) return 'unreadable'
    condition[side] = {
      value: bound,
      strict: !relation.endsWith('='),
      tex: member,
    }
  }
  if (condition.inf == null && condition.sup == null) return 'unreadable'
  return condition
}

function boundFeedback(input?: Bound, answer?: Bound): string | undefined {
  if (input == null && answer == null) return undefined
  if (input == null) return 'Il manque une inégalité.'
  if (answer == null) return `Il y a une erreur avec la valeur $${input.tex}$.`
  if (Math.abs(input.value - answer.value) > tolerance)
    return `Il y a une erreur avec la valeur $${input.tex}$.`
  if (input.strict !== answer.strict)
    return `Il y a une erreur avec le symbole en $${input.tex}$.`
  return undefined
}

export function sameIntervalCondition(
  options: CheckOverrides & { variable?: string } = {},
): Check {
  const variable = options.variable ?? 'x'
  return {
    name: options.name ?? 'sameIntervalCondition',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (input, answer) => {
      const parsedInput = parseIntervalCondition(input, variable)
      const parsedAnswer = parseIntervalCondition(answer, variable)
      let feedbackKo: string | undefined
      if (typeof parsedAnswer === 'string') {
        feedbackKo = 'Erreur dans la réponse attendue.'
      } else if (parsedInput === 'unreadable') {
        feedbackKo = 'Écrire une inégalité ou un encadrement.'
      } else if (parsedInput === 'mixedDirections') {
        feedbackKo = 'Les deux inégalités ne sont pas dans le même sens.'
      } else {
        feedbackKo =
          boundFeedback(parsedInput.inf, parsedAnswer.inf) ??
          boundFeedback(parsedInput.sup, parsedAnswer.sup)
      }
      return {
        passed: feedbackKo == null,
        feedbackKo: options.feedbackKo ?? feedbackKo ?? '',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
