import { ComputeEngine } from '@cortex-js/compute-engine'
import type { ResultType } from '../types'
import { generateCleaner } from '../interactif/cleaners'
import type { CompositionCase } from './deriveesComposees'
import { evaluate, realPower } from './deriveesComposeesExpressions'

const engine = new ComputeEngine()
const clean = generateCleaner([
  'virgules',
  'parentheses',
  'fractions',
  'divisions',
])
type Rational = [number, number]
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

/** Exposants rationnels exacts, notamment pour les bases négatives. */
function rational(json: unknown): Rational | undefined {
  if (typeof json === 'number' && Number.isInteger(json)) return [json, 1]
  if (!Array.isArray(json)) return undefined
  if (json[0] === 'Negate') {
    const r = rational(json[1])
    return r && [-r[0], r[1]]
  }
  const a = rational(json[1])
  const b = rational(json[2])
  if (!a || !b) return undefined
  let n: number
  let d: number
  switch (json[0]) {
    case 'Divide':
    case 'Rational':
      n = a[0] * b[1]
      d = a[1] * b[0]
      break
    case 'Multiply':
    case 'InvisibleOperator':
      n = a[0] * b[0]
      d = a[1] * b[1]
      break
    case 'Add':
      n = a[0] * b[1] + b[0] * a[1]
      d = a[1] * b[1]
      break
    case 'Subtract':
      n = a[0] * b[1] - b[0] * a[1]
      d = a[1] * b[1]
      break
    default:
      return undefined
  }
  if (d === 0) return undefined
  const factor = gcd(Math.abs(n), Math.abs(d)) * Math.sign(d)
  return [n / factor, d / factor]
}

/** Évaluation réelle d'un sous-ensemble explicite de MathJSON, sans exécution de code. */
export function evaluateAnswer(json: unknown, x: number): number {
  if (typeof json === 'number') return json
  if (typeof json === 'string') {
    if (json === 'x') return x
    if (json === 'ExponentialE') return Math.E
    if (json === 'Pi') return Math.PI
    return Number.NaN
  }
  if (json && typeof json === 'object' && 'num' in json) return Number(json.num)
  if (!Array.isArray(json)) return Number.NaN
  const args = json.slice(1).map((v) => evaluateAnswer(v, x))
  // Un symbole inconnu ne doit jamais disparaître dans 0*y ou y^0.
  if (args.some((v) => !Number.isFinite(v))) return Number.NaN
  const [a, b] = args
  switch (json[0]) {
    case 'Add':
      return args.reduce((s, v) => s + v, 0)
    case 'Subtract':
      return a - b
    case 'Negate':
      return -a
    case 'Multiply':
    case 'InvisibleOperator':
      return args.reduce((p, v) => p * v, 1)
    case 'Divide':
    case 'Rational':
      return a / b
    case 'Power': {
      if (json[1] === 'ExponentialE') return Math.exp(b)
      const r = rational(json[2])
      return r ? realPower(a, r[0], r[1]) : a >= 0 ? Math.pow(a, b) : Number.NaN
    }
    case 'Root':
      return Number.isInteger(b) && b > 0 ? realPower(a, 1, b) : Number.NaN
    case 'Sqrt':
      return Math.sqrt(a)
    case 'Square':
      return a * a
    case 'Sin':
      return Math.sin(a)
    case 'Cos':
      return Math.cos(a)
    case 'Tan':
      return Math.tan(a)
    case 'Arcsin':
      return Math.asin(a)
    case 'Arctan':
      return Math.atan(a)
    case 'Sec':
      return 1 / Math.cos(a)
    case 'Csc':
      return 1 / Math.sin(a)
    case 'Cot':
      return 1 / Math.tan(a)
    case 'Exp':
      return Math.exp(a)
    case 'Ln':
      return Math.log(a)
    case 'Abs':
      return Math.abs(a)
    case 'Delimiter':
      return a
    default:
      return Number.NaN
  }
}

export function derivativeComparator(
  c: Pick<CompositionCase, 'samples' | 'derived'>,
): (input: string, answer: string) => ResultType {
  return (input, _answer) => {
    if (!input.trim())
      return { isOk: false, feedback: 'Une réponse doit être saisie.' }
    try {
      // La forme brute préserve les racines réelles impaires : une canonisation
      // complexe de (-8)^(1/3) ne convient pas à ce catalogue de fonctions réelles.
      const parsed = engine.parse(clean(input), { form: 'raw' })
      if (!parsed.isValid || c.samples.length < 12)
        return {
          isOk: false,
          feedback: 'Saisir une expression réelle en fonction de $x$.',
        }
      let comparable = 0
      for (const x of c.samples) {
        const actual = evaluateAnswer(parsed.json, x)
        const expected = evaluate(c.derived, x)
        if (!Number.isFinite(actual))
          return {
            isOk: false,
            feedback:
              "La réponse n'est pas définie sur l'ensemble demandé ou contient un symbole inconnu.",
          }
        const tolerance =
          1e-8 * Math.max(1e-250, Math.abs(actual), Math.abs(expected))
        if (Math.abs(actual - expected) > tolerance)
          return {
            isOk: false,
            feedback:
              "L'expression proposée n'est pas la dérivée attendue. Vérifier la règle de dérivation utilisée pour chaque somme, produit, quotient ou composition.",
          }
        comparable++
      }
      return { isOk: comparable >= 12, feedback: '' }
    } catch {
      return {
        isOk: false,
        feedback:
          "La réponse n'a pas pu être interprétée. Vérifier les parenthèses et la notation des fonctions.",
      }
    }
  }
}
