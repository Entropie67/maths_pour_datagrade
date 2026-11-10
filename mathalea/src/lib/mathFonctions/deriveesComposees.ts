import { naturalDerivativeSteps } from './deriveesCorrection'
import type { FormulaireComplexe } from '../formulaireComplexe'
import { choice } from '../outils/arrayOutils'
import { miseEnEvidence } from '../outils/embellissements'
import { randint } from '../../modules/outils'
import {
  call,
  constraints,
  derivative,
  domainLatex,
  evaluate,
  latex,
  normalizeSigns,
  number,
  power,
  product,
  quotient,
  satisfies,
  simplifyConstraints,
  simplifyResult,
  substitute,
  sum,
  variable,
  type Constraint,
  type Expression,
} from './deriveesComposeesExpressions'

export const outerFamilies = [
  'power',
  'reciprocal',
  'root',
  'sin',
  'cos',
  'tan',
  'exp',
  'ln',
] as const
export const innerFamilies = [
  'affine',
  'polynomial',
  'reciprocal',
  'root',
  'sin',
  'cos',
  'tan',
  'exp',
  'ln',
] as const
export type OuterFamily = (typeof outerFamilies)[number]
export type InnerFamily = (typeof innerFamilies)[number]
export type Progression = 'affine' | 'nonAffine'
export const progressions: Progression[] = ['affine', 'nonAffine']
const labels: Record<OuterFamily | InnerFamily, string> = {
  affine: 'Affine',
  polynomial: 'Polynôme',
  power: 'Puissance entière',
  reciprocal: 'Inverse / fonction rationnelle',
  root: 'Racine carrée',
  sin: 'Sinus',
  cos: 'Cosinus',
  tan: 'Tangente',
  exp: 'Exponentielle',
  ln: 'Logarithme népérien',
}
export const compositionForm: FormulaireComplexe = {
  titre:
    'Les associations inverse/inverse et logarithme/exponentielle utilisent un polynôme intérieur.',
  champs: [
    {
      type: 'listePonderee',
      nom: 'outer',
      label: 'Fonction extérieure',
      items: outerFamilies.map((nom) => ({
        nom,
        label: labels[nom],
        poids: 1,
      })),
    },
    {
      type: 'listePonderee',
      nom: 'inner',
      label: 'Fonction intérieure',
      items: innerFamilies.map((nom) => ({
        nom,
        label: labels[nom],
        poids: nom === 'polynomial' ? 1 : 0,
      })),
    },
  ],
}

export type CompositionCase = {
  expression: Expression
  derived: Expression
  outer: Expression
  inner: Expression
  domain: Constraint[]
  differentiability: Constraint[]
  samples: number[]
  progression: Progression
  outerFamily: OuterFamily
  innerFamily: InnerFamily
}

type Draw = {
  a: number
  b: number
  n: number
  integerPower: number
}
function draw(): Draw {
  return {
    a: randint(1, 3),
    b: randint(1, 3) * choice([-1, 1]),
    n: randint(2, 3),
    integerPower: randint(2, 3) * choice([-1, 1]),
  }
}

function outerExpression(family: OuterFamily, d: Draw): Expression {
  switch (family) {
    case 'power':
      return power(variable, d.integerPower)
    case 'reciprocal':
      return quotient(number(1), variable)
    case 'root':
      return power(variable, 1, 2)
    default:
      return call(family, variable)
  }
}

/** Deux fonctions seulement : aucune translation n'est cachée dans une racine ou un inverse. */
function innerExpression(family: InnerFamily, d: Draw): Expression {
  switch (family) {
    case 'affine':
      return sum(product(number(d.a * Math.sign(d.b)), variable), number(d.b))
    case 'polynomial':
      return sum(product(number(d.a), power(variable, d.n)), number(d.b))
    case 'reciprocal':
      return quotient(number(d.a), variable)
    case 'root':
      return product(number(d.a), power(variable, 1, 2))
    default:
      return product(number(d.a), call(family, variable))
  }
}

/** Points déterministes et multiscales : ils ne consomment jamais le tirage de l'exercice. */
function radicalInverse(index: number): number {
  let result = 0
  let factor = 0.5
  while (index) {
    result += (index % 2) * factor
    index = Math.floor(index / 2)
    factor /= 2
  }
  return result
}

export function sampleCase(
  expression: Expression,
  derived: Expression,
  domain: Constraint[],
): number[] {
  const buckets: number[][] = [[], [], [], []]
  const bucketFor = (x: number) => (x < -1 ? 0 : x < 0 ? 1 : x < 1 ? 2 : 3)
  // Explorer jusqu'à ±32 et aussi le voisinage de zéro, sans toucher les pôles.
  for (let i = 1; i <= 1536; i++) {
    const scale = [1, 4, 16, 32][i % 4]
    const x = (2 * radicalInverse(i) - 1) * scale + 0.000137
    const bucket = buckets[bucketFor(x)]
    if (bucket.length >= 12 || !satisfies(domain, x, 1e-5)) continue
    const value = evaluate(expression, x)
    const slope = evaluate(derived, x)
    if (
      numericallySafe(expression, x) &&
      numericallySafe(derived, x) &&
      Number.isFinite(value) &&
      Number.isFinite(slope) &&
      Math.abs(value) < 1e8 &&
      Math.abs(slope) < 1e8
    )
      bucket.push(x)
  }
  return buckets.flat()
}

/** Éviter aussi les débordements des calculs intermédiaires, pas seulement du résultat. */
function numericallySafe(e: Expression, x: number): boolean {
  const value = evaluate(e, x)
  if (!Number.isFinite(value) || Math.abs(value) > 1e10) return false
  switch (e.kind) {
    case 'number':
    case 'variable':
      return true
    case 'sum':
    case 'product':
      return e.terms.every((t) => numericallySafe(t, x))
    case 'quotient':
      return (
        Math.abs(evaluate(e.denominator, x)) > 1e-10 &&
        numericallySafe(e.numerator, x) &&
        numericallySafe(e.denominator, x)
      )
    case 'power':
      return numericallySafe(e.base, x)
    default:
      return numericallySafe(e.argument, x)
  }
}

export function buildCase(
  outer: Expression,
  inner: Expression,
  options: {
    progression?: Progression
    outerFamily?: OuterFamily
    innerFamily?: InnerFamily
  } = {},
): CompositionCase {
  const expression = substitute(outer, inner)
  const rawDerivative = product(
    substitute(derivative(outer), inner),
    derivative(inner),
  )
  const derived = normalizeSigns(simplifyResult(rawDerivative))
  const domain = constraints(expression)
  // Les racines paires ont des extrémités exclues de la dérivabilité usuelle,
  // même lorsque l'exposant est supérieur à 1 (pas de dérivée bilatérale au bord).
  const differentiability = simplifyConstraints([
    ...domain.map((c) =>
      c.relation === 'nonnegative'
        ? { ...c, relation: 'positive' as const }
        : c,
    ),
    ...constraints(rawDerivative),
  ])
  return {
    outer,
    inner,
    expression,
    derived,
    domain,
    differentiability,
    samples: sampleCase(expression, derived, differentiability),
    progression: options.progression ?? 'nonAffine',
    outerFamily: options.outerFamily ?? 'power',
    innerFamily: options.innerFamily ?? 'polynomial',
    ...options,
  }
}

export function generateComposition(
  progression: Progression,
  outerFamily: OuterFamily,
  innerFamily: InnerFamily,
): CompositionCase {
  for (let attempt = 0; attempt <= 32; attempt++) {
    const d = attempt === 32 ? { a: 2, b: 1, n: 2, integerPower: 3 } : draw()
    const outer = outerExpression(outerFamily, d)
    const trivial =
      (outerFamily === 'reciprocal' && innerFamily === 'reciprocal') ||
      (outerFamily === 'ln' && innerFamily === 'exp')
    const effectiveInner =
      progression === 'affine' ? 'affine' : trivial ? 'polynomial' : innerFamily
    const inner = innerExpression(effectiveInner, d)
    const result = buildCase(outer, inner, {
      progression,
      outerFamily,
      innerFamily: effectiveInner,
    })
    if (result.samples.length >= 12 || attempt === 32) return result
  }
  // Ce cas signale une régression du catalogue, et non une configuration vide.
  throw new Error(
    `Catalogue de dérivation sans candidat : ${progression}/${outerFamily}/${innerFamily}`,
  )
}

export function compositionStatement(c: CompositionCase): string {
  const domain = domainLatex(c.domain)
  const differentiability = domainLatex(c.differentiability)
  return (
    `Soit $h$ la fonction définie sur $D_h=${domain}$ par $h(x)=${latex(c.expression)}$.<br>` +
    (domain === differentiability
      ? "Déterminer une expression de $h'(x)$ sur $D_h$."
      : `Déterminer une expression de $h'(x)$ sur $${differentiability}$.`)
  )
}

export function compositionCorrection(c: CompositionCase): string {
  return (
    `La fonction $h$ est dérivable sur $${domainLatex(c.differentiability)}$.<br>` +
    naturalDerivativeSteps(c.expression) +
    `Ainsi, $h'(x)=${miseEnEvidence(latex(c.derived))}$.`
  )
}
