import { fonctionComparaison } from '../comparisonFunctions'
import type { Check, CheckOverrides } from './types'

/** Module et arguments lus ; un terme absent de la saisie vaut `null`. */
type TrigonometricForm = {
  module: string
  cos: string | null
  sin: string | null
}

/** Retire de la saisie MathLive ce qui ne change pas l'écriture. */
function normalize(value: string): string {
  return value
    .replace(/\\left|\\right/g, '')
    .replace(/\\lparen/g, '(')
    .replace(/\\rparen/g, ')')
    .replace(/\\(?:mathrm|text)\{i\}|\\imaginaryI/g, 'i')
    .replace(/\{i\}/g, 'i')
    .replace(/\\[,;:! ]|\s/g, '')
}

/** Lit un argument : `(…)` équilibré ou terme jusqu'au premier `+` hors accolades. */
function readArgument(
  value: string,
  start: number,
): { text: string; end: number } | null {
  if (value[start] === '(') {
    let depth = 0
    for (let k = start; k < value.length; k++) {
      if (value[k] === '(') depth++
      if (value[k] === ')') depth--
      if (depth === 0) return { text: value.slice(start + 1, k), end: k + 1 }
    }
    return null
  }
  let depth = 0
  let k = start
  for (; k < value.length; k++) {
    if (value[k] === '{') depth++
    if (value[k] === '}') depth--
    if (depth === 0 && (value[k] === '+' || value[k] === ')')) break
  }
  return k > start ? { text: value.slice(start, k), end: k } : null
}

/** Retire le signe de produit qui sépare le module du facteur suivant. */
const withoutProduct = (value: string) =>
  value.replace(/(?:\\times|\\cdot|\*)$/, '')

/**
 * Décompose `r(\cos(a)+i\sin(b))` en module et arguments. Le module `1`, le
 * terme en cosinus (`ri\sin(b)`) et le terme en sinus (`r\cos(a)`) peuvent
 * être absents de la saisie ; les parenthèses autour de la somme sont
 * facultatives.
 */
function parse(value: string): TrigonometricForm | null {
  const n = normalize(value)
  const cosIndex = n.indexOf('\\cos')
  const sinIndex = n.indexOf('\\sin')
  if (cosIndex < 0 && sinIndex < 0) return null
  const cosFirst = cosIndex >= 0 && (sinIndex < 0 || cosIndex < sinIndex)
  const first = cosFirst ? cosIndex : sinIndex
  let head = n.slice(0, first)
  if (!cosFirst) {
    if (!head.endsWith('i')) return null
    head = head.slice(0, -1)
  }
  head = withoutProduct(head)
  const wrapped = head.endsWith('(')
  if (wrapped) head = withoutProduct(head.slice(0, -1))
  const module = head || '1'
  // MathLive ne referme pas le « ( » tapé au clavier : la parenthèse externe
  // peut manquer à la fin de la saisie.
  const isEnd = (rest: string) => rest === '' || (wrapped && rest === ')')
  if (!cosFirst) {
    const sin = readArgument(n, first + '\\sin'.length)
    if (sin == null || !isEnd(n.slice(sin.end))) return null
    return { module, cos: null, sin: sin.text }
  }
  const cos = readArgument(n, first + '\\cos'.length)
  if (cos == null) return null
  if (isEnd(n.slice(cos.end))) return { module, cos: cos.text, sin: null }
  if (!n.startsWith('+i\\sin', cos.end)) return null
  const sin = readArgument(n, cos.end + '+i\\sin'.length)
  if (sin == null || !isEnd(n.slice(sin.end))) return null
  return { module, cos: cos.text, sin: sin.text }
}

const equal = (saisie: string, answer: string) =>
  fonctionComparaison(saisie, answer).isOk

/** Le sinus de l'argument attendu est nul : l'argument vaut 0 ou \pi. */
const sinIsZero = ({ cos }: TrigonometricForm) =>
  cos != null && ['0', '\\pi'].some((angle) => equal(cos, angle))

/** Le cosinus de l'argument attendu est nul : l'argument vaut \pm\pi/2. */
const cosIsZero = ({ cos }: TrigonometricForm) =>
  cos != null &&
  ['\\dfrac{\\pi}{2}', '-\\dfrac{\\pi}{2}'].some((angle) => equal(cos, angle))

/**
 * Vérifie une forme trigonométrique `r(\cos(\theta)+\mathrm{i}\sin(\theta))` :
 * la saisie doit avoir cette écriture, avec le module et l'argument de la
 * réponse attendue, le même argument dans le cosinus et dans le sinus. Module
 * et argument sont comparés comme des expressions (écritures équivalentes).
 * Le module 1 et un terme nul (`\cos` quand l'argument vaut \pm\pi/2, `\sin`
 * quand il vaut 0 ou \pi) peuvent être omis.
 */
export function sameTrigonometricForm(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'sameTrigonometricForm',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const expected = parse(answer)
      const given = parse(saisie)
      const feedbackKo = (message: string) => ({
        passed: false,
        feedbackKo: options.feedbackKo ?? message,
      })
      if (expected == null) {
        return feedbackKo(
          "La réponse attendue n'est pas une forme trigonométrique.",
        )
      }
      if (given == null) {
        return feedbackKo('Écrire la forme $r(\\cos\\theta+i\\sin\\theta)$.')
      }
      if (given.cos != null && given.sin != null) {
        if (!equal(given.cos, given.sin)) {
          return feedbackKo(
            'Utiliser le même argument dans le cosinus et dans le sinus.',
          )
        }
      } else if (
        (given.sin == null && !sinIsZero(expected)) ||
        (given.cos == null && !cosIsZero(expected))
      ) {
        return feedbackKo('Écrire la forme $r(\\cos\\theta+i\\sin\\theta)$.')
      }
      if (!equal(given.module, expected.module)) {
        return feedbackKo('Le module est incorrect.')
      }
      const argument = given.cos ?? given.sin ?? ''
      return equal(argument, expected.cos ?? '')
        ? { passed: true, feedbackKo: '', feedbackOk: options.feedbackOk }
        : feedbackKo("L'argument est incorrect.")
    },
  }
}
