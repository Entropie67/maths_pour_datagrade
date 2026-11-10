import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'

export type TrigoFunctionName = 'cos' | 'sin' | 'tan'
export type SinCosTrigoFunctionName = Exclude<TrigoFunctionName, 'tan'>
export type ExactTrigoValueKey =
  | '-1'
  | '-sqrt(3)/2'
  | '-sqrt(2)/2'
  | '-1/2'
  | '0'
  | '1/2'
  | 'sqrt(2)/2'
  | 'sqrt(3)/2'
  | '1'
  | '-sqrt(3)'
  | '-sqrt(3)/3'
  | 'sqrt(3)/3'
  | 'sqrt(3)'
  | 'undefined'

export type ExactSquaredTrigValueKey = '0' | '1/4' | '1/2' | '3/4' | '1'

export type ExactTrigoValue = {
  key: ExactTrigoValueKey
  tex: string
}

export type ExactSquaredTrigoValue = {
  key?: ExactSquaredTrigValueKey
  tex: string
  roots: ExactTrigoValue[]
}

export type FractionData = {
  num: number
  den: number
}

export type LinearTrigoArgument = {
  coefficient: number
  phase: FractionEtendue
}

export type TrigoCircleAngle = {
  angleDeg: number
  angleRad: FractionEtendue
  angleTex: string
  cosTex: string
  sinTex: string
  tanTex: string
  cosKey: ExactTrigoValueKey
  sinKey: ExactTrigoValueKey
  tanKey: ExactTrigoValueKey
  x: number
  y: number
}

const piFractions = [
  [0, 1, '0', '1', '0', '0', '1', '0', '0'],
  [
    1,
    6,
    '\\dfrac{\\pi}{6}',
    '\\dfrac{\\sqrt{3}}{2}',
    '\\dfrac{1}{2}',
    '\\dfrac{\\sqrt{3}}{3}',
    'sqrt(3)/2',
    '1/2',
    'sqrt(3)/3',
  ],
  [
    1,
    4,
    '\\dfrac{\\pi}{4}',
    '\\dfrac{\\sqrt{2}}{2}',
    '\\dfrac{\\sqrt{2}}{2}',
    '1',
    'sqrt(2)/2',
    'sqrt(2)/2',
    '1',
  ],
  [
    1,
    3,
    '\\dfrac{\\pi}{3}',
    '\\dfrac{1}{2}',
    '\\dfrac{\\sqrt{3}}{2}',
    '\\sqrt{3}',
    '1/2',
    'sqrt(3)/2',
    'sqrt(3)',
  ],
  [
    1,
    2,
    '\\dfrac{\\pi}{2}',
    '0',
    '1',
    '\\text{non définie}',
    '0',
    '1',
    'undefined',
  ],
  [
    2,
    3,
    '\\dfrac{2\\pi}{3}',
    '-\\dfrac{1}{2}',
    '\\dfrac{\\sqrt{3}}{2}',
    '-\\sqrt{3}',
    '-1/2',
    'sqrt(3)/2',
    '-sqrt(3)',
  ],
  [
    3,
    4,
    '\\dfrac{3\\pi}{4}',
    '-\\dfrac{\\sqrt{2}}{2}',
    '\\dfrac{\\sqrt{2}}{2}',
    '-1',
    '-sqrt(2)/2',
    'sqrt(2)/2',
    '-1',
  ],
  [
    5,
    6,
    '\\dfrac{5\\pi}{6}',
    '-\\dfrac{\\sqrt{3}}{2}',
    '\\dfrac{1}{2}',
    '-\\dfrac{\\sqrt{3}}{3}',
    '-sqrt(3)/2',
    '1/2',
    '-sqrt(3)/3',
  ],
  [1, 1, '\\pi', '-1', '0', '0', '-1', '0', '0'],
  [
    7,
    6,
    '\\dfrac{7\\pi}{6}',
    '-\\dfrac{\\sqrt{3}}{2}',
    '-\\dfrac{1}{2}',
    '\\dfrac{\\sqrt{3}}{3}',
    '-sqrt(3)/2',
    '-1/2',
    'sqrt(3)/3',
  ],
  [
    5,
    4,
    '\\dfrac{5\\pi}{4}',
    '-\\dfrac{\\sqrt{2}}{2}',
    '-\\dfrac{\\sqrt{2}}{2}',
    '1',
    '-sqrt(2)/2',
    '-sqrt(2)/2',
    '1',
  ],
  [
    4,
    3,
    '\\dfrac{4\\pi}{3}',
    '-\\dfrac{1}{2}',
    '-\\dfrac{\\sqrt{3}}{2}',
    '\\sqrt{3}',
    '-1/2',
    '-sqrt(3)/2',
    'sqrt(3)',
  ],
  [
    3,
    2,
    '\\dfrac{3\\pi}{2}',
    '0',
    '-1',
    '\\text{non définie}',
    '0',
    '-1',
    'undefined',
  ],
  [
    5,
    3,
    '\\dfrac{5\\pi}{3}',
    '\\dfrac{1}{2}',
    '-\\dfrac{\\sqrt{3}}{2}',
    '-\\sqrt{3}',
    '1/2',
    '-sqrt(3)/2',
    '-sqrt(3)',
  ],
  [
    7,
    4,
    '\\dfrac{7\\pi}{4}',
    '\\dfrac{\\sqrt{2}}{2}',
    '-\\dfrac{\\sqrt{2}}{2}',
    '-1',
    'sqrt(2)/2',
    '-sqrt(2)/2',
    '-1',
  ],
  [
    11,
    6,
    '\\dfrac{11\\pi}{6}',
    '\\dfrac{\\sqrt{3}}{2}',
    '-\\dfrac{1}{2}',
    '-\\dfrac{\\sqrt{3}}{3}',
    'sqrt(3)/2',
    '-1/2',
    '-sqrt(3)/3',
  ],
] as const

export const trigoCircleAngles: TrigoCircleAngle[] = piFractions.map(
  ([num, den, angleTex, cosTex, sinTex, tanTex, cosKey, sinKey, tanKey]) => {
    const angleDeg = (num / den) * 180
    return {
      angleDeg,
      angleRad: fraction(num, den),
      angleTex,
      cosTex,
      sinTex,
      tanTex,
      cosKey,
      sinKey,
      tanKey,
      x: Math.cos((angleDeg * Math.PI) / 180),
      y: Math.sin((angleDeg * Math.PI) / 180),
    }
  },
)

export const exactTrigoValues: ExactTrigoValue[] = [
  { key: '-1', tex: '-1' },
  { key: '-sqrt(3)/2', tex: '-\\dfrac{\\sqrt{3}}{2}' },
  { key: '-sqrt(2)/2', tex: '-\\dfrac{\\sqrt{2}}{2}' },
  { key: '-1/2', tex: '-\\dfrac{1}{2}' },
  { key: '0', tex: '0' },
  { key: '1/2', tex: '\\dfrac{1}{2}' },
  { key: 'sqrt(2)/2', tex: '\\dfrac{\\sqrt{2}}{2}' },
  { key: 'sqrt(3)/2', tex: '\\dfrac{\\sqrt{3}}{2}' },
  { key: '1', tex: '1' },
]

export const exactTangentValues: ExactTrigoValue[] = [
  { key: '-sqrt(3)', tex: '-\\sqrt{3}' },
  { key: '-1', tex: '-1' },
  { key: '-sqrt(3)/3', tex: '-\\dfrac{\\sqrt{3}}{3}' },
  { key: '0', tex: '0' },
  { key: 'sqrt(3)/3', tex: '\\dfrac{\\sqrt{3}}{3}' },
  { key: '1', tex: '1' },
  { key: 'sqrt(3)', tex: '\\sqrt{3}' },
]

export const exactTrigoValuesByFunction: Record<
  TrigoFunctionName,
  ExactTrigoValue[]
> = {
  sin: exactTrigoValues,
  cos: exactTrigoValues,
  tan: exactTangentValues,
}

export const exactSquaredTrigoValues: ExactSquaredTrigoValue[] = [
  { key: '0', tex: '0', roots: [{ key: '0', tex: '0' }] },
  {
    key: '1/4',
    tex: '\\dfrac{1}{4}',
    roots: [
      { key: '-1/2', tex: '-\\dfrac{1}{2}' },
      { key: '1/2', tex: '\\dfrac{1}{2}' },
    ],
  },
  {
    key: '1/2',
    tex: '\\dfrac{1}{2}',
    roots: [
      { key: '-sqrt(2)/2', tex: '-\\dfrac{\\sqrt{2}}{2}' },
      { key: 'sqrt(2)/2', tex: '\\dfrac{\\sqrt{2}}{2}' },
    ],
  },
  {
    key: '3/4',
    tex: '\\dfrac{3}{4}',
    roots: [
      { key: '-sqrt(3)/2', tex: '-\\dfrac{\\sqrt{3}}{2}' },
      { key: 'sqrt(3)/2', tex: '\\dfrac{\\sqrt{3}}{2}' },
    ],
  },
  {
    key: '1',
    tex: '1',
    roots: [
      { key: '-1', tex: '-1' },
      { key: '1', tex: '1' },
    ],
  },
]

export const exactSquaredTangentValues = [
  { tex: '0', roots: [{ key: '0', tex: '0' }] },
  {
    tex: '\\dfrac{1}{3}',
    roots: [
      { key: '-sqrt(3)/3', tex: '-\\dfrac{\\sqrt{3}}{3}' },
      { key: 'sqrt(3)/3', tex: '\\dfrac{\\sqrt{3}}{3}' },
    ],
  },
  {
    tex: '1',
    roots: [
      { key: '-1', tex: '-1' },
      { key: '1', tex: '1' },
    ],
  },
  {
    tex: '3',
    roots: [
      { key: '-sqrt(3)', tex: '-\\sqrt{3}' },
      { key: 'sqrt(3)', tex: '\\sqrt{3}' },
    ],
  },
] satisfies Array<{ tex: string; roots: ExactTrigoValue[] }>

export const exactSquaredTrigoValuesByFunction = {
  sin: exactSquaredTrigoValues,
  cos: exactSquaredTrigoValues,
  tan: exactSquaredTangentValues,
} satisfies Record<
  TrigoFunctionName,
  Array<{ tex: string; roots: ExactTrigoValue[] }>
>

export function normalizeAnglePiFraction(
  angle: number | FractionEtendue,
): FractionEtendue {
  const raw = typeof angle === 'number' ? fraction(angle, 1) : angle
  const periodNumerator = 2 * raw.den
  const normalizedNumerator =
    ((raw.num % periodNumerator) + periodNumerator) % periodNumerator
  return fraction(normalizedNumerator, raw.den)
}

export function angleTex(angle: number | FractionEtendue): string {
  const normalized = normalizeAnglePiFraction(angle)
  if (normalized.num === 0) return '0'
  if (normalized.num === normalized.den) return '\\pi'
  if (normalized.den === 1) return `${normalized.num}\\pi`
  if (normalized.num === 1) return `\\dfrac{\\pi}{${normalized.den}}`
  return `\\dfrac{${normalized.num}\\pi}{${normalized.den}}`
}

export function texTrigoFunction(fn: TrigoFunctionName) {
  if (fn === 'sin') return '\\sin'
  if (fn === 'cos') return '\\cos'
  return '\\tan'
}

export function texPiCoefficient(coefficient: FractionData): string {
  const fractionValue = fraction(coefficient.num, coefficient.den)
  if (fractionValue.s === 0) return '0'
  if (fractionValue.d === 1) {
    if (fractionValue.n === 1) return `${fractionValue.s < 0 ? '-' : ''}\\pi`
    return `${fractionValue.s < 0 ? '-' : ''}${fractionValue.n}\\pi`
  }
  return `${fractionValue.s < 0 ? '-' : ''}\\dfrac{${fractionValue.n === 1 ? '' : fractionValue.n}\\pi}{${fractionValue.d}}`
}

export function texPiFraction(value: FractionEtendue) {
  const simplified = value.simplifie()
  const sign = simplified.num < 0 ? '-' : ''
  const absNum = Math.abs(simplified.num)
  if (absNum === 0) return '0'
  if (absNum === simplified.den) return `${sign}\\pi`
  if (simplified.den === 1) return `${sign}${absNum}\\pi`
  if (absNum === 1) return `${sign}\\dfrac{\\pi}{${simplified.den}}`
  return `${sign}\\dfrac{${absNum}\\pi}{${simplified.den}}`
}

export function texPiCoefficientFraction(coefficient: FractionEtendue): string {
  const simplified = coefficient.simplifie()
  return texPiCoefficient({
    num: simplified.numIrred,
    den: simplified.denIrred,
  })
}

export function texSignedPiTerm(coefficient: FractionData): string {
  const fractionValue = fraction(coefficient.num, coefficient.den)
  if (fractionValue.s === 0) return ''
  const unsigned = texPiCoefficient({
    num: Math.abs(coefficient.num),
    den: coefficient.den,
  })
  return `${fractionValue.s < 0 ? '-' : '+'}${unsigned}`
}

export function texSignedPiPhase(phase: FractionEtendue) {
  const simplified = phase.simplifie()
  if (simplified.num === 0) return ''
  const absPhase = fraction(Math.abs(simplified.num), simplified.den)
  return `${simplified.num > 0 ? '+' : '-'}${texPiFraction(absPhase)}`
}

export function texLinearTrigoArgument(argument: LinearTrigoArgument) {
  const variable = argument.coefficient === 1 ? 'x' : `${argument.coefficient}x`
  return `${variable}${texSignedPiPhase(argument.phase)}`
}

function texRadicalProduct(
  coefficient: number,
  denominator: number,
  radicand: 2 | 3,
) {
  const scalar = fraction(coefficient, denominator).simplifie()
  const sign = scalar.s < 0 ? '-' : ''
  const radical = `\\sqrt{${radicand}}`
  const numerator = `${scalar.n === 1 ? '' : scalar.n}${radical}`

  if (scalar.d === 1) return `${sign}${numerator}`
  return `${sign}\\dfrac{${numerator}}{${scalar.d}}`
}

export function texIntegerProductWithExactTrigoValue(
  coefficient: number,
  value: ExactTrigoValue,
) {
  switch (value.key) {
    case '-1':
      return fraction(-coefficient, 1).texFSD
    case '1':
      return fraction(coefficient, 1).texFSD
    case '-1/2':
      return fraction(-coefficient, 2).texFSD
    case '1/2':
      return fraction(coefficient, 2).texFSD
    case '-sqrt(2)/2':
      return texRadicalProduct(-coefficient, 2, 2)
    case 'sqrt(2)/2':
      return texRadicalProduct(coefficient, 2, 2)
    case '-sqrt(3)/2':
      return texRadicalProduct(-coefficient, 2, 3)
    case 'sqrt(3)/2':
      return texRadicalProduct(coefficient, 2, 3)
    case '-sqrt(3)/3':
      return texRadicalProduct(-coefficient, 3, 3)
    case 'sqrt(3)/3':
      return texRadicalProduct(coefficient, 3, 3)
    case '-sqrt(3)':
      return texRadicalProduct(-coefficient, 1, 3)
    case 'sqrt(3)':
      return texRadicalProduct(coefficient, 1, 3)
    case '0':
      return '0'
    default:
      return `${coefficient}\\cdot ${value.tex}`
  }
}

export function exactTrigValuesForAngle(
  angle: number | FractionEtendue,
): TrigoCircleAngle | undefined {
  const normalized = normalizeAnglePiFraction(angle)
  return trigoCircleAngles.find(
    (entry) =>
      entry.angleRad.num === normalized.num &&
      entry.angleRad.den === normalized.den,
  )
}

export function anglesForExactTrigValue(
  fn: TrigoFunctionName,
  value: ExactTrigoValueKey,
): TrigoCircleAngle[] {
  const key = `${fn}Key` as const
  return trigoCircleAngles.filter((angle) => angle[key] === value)
}

export function baseSolutionsForExactTrigValue(
  fn: TrigoFunctionName,
  value: ExactTrigoValue,
) {
  return anglesForExactTrigValue(fn, value.key).map((solution) =>
    solution.angleRad.simplifie(),
  )
}

export function uniqueSortedTrigoAngles(solutions: FractionEtendue[]) {
  const byKey = new Map<string, FractionEtendue>()
  for (const solution of solutions) {
    const normalized = normalizeAnglePiFraction(solution).simplifie()
    byKey.set(`${normalized.num}/${normalized.den}`, normalized)
  }
  return Array.from(byKey.values()).sort(
    (a, b) => a.num / a.den - b.num / b.den,
  )
}

export function sameTrigoAngleSet(
  first: FractionEtendue[],
  second: FractionEtendue[],
) {
  const normalize = (solutions: FractionEtendue[]) =>
    uniqueSortedTrigoAngles(solutions).map(
      (solution) => `${solution.num}/${solution.den}`,
    )
  const firstKeys = normalize(first)
  const secondKeys = normalize(second)
  return (
    firstKeys.length === secondKeys.length &&
    firstKeys.every((key, index) => key === secondKeys[index])
  )
}

export function solveLinearTrigoCongruences(
  baseSolutions: FractionEtendue[],
  argument: LinearTrigoArgument,
) {
  const solutions: FractionEtendue[] = []
  for (const baseSolution of baseSolutions) {
    for (let n = 0; n < argument.coefficient; n++) {
      const shiftedAngle = baseSolution
        .sommeFraction(fraction(2 * n, 1))
        .differenceFraction(argument.phase)
      solutions.push(
        shiftedAngle.diviseFraction(fraction(argument.coefficient, 1)),
      )
    }
  }
  return uniqueSortedTrigoAngles(solutions)
}

export function solveLinearTrigoEquation(
  fn: TrigoFunctionName,
  value: ExactTrigoValue,
  argument: LinearTrigoArgument,
) {
  return solveLinearTrigoCongruences(
    baseSolutionsForExactTrigValue(fn, value),
    argument,
  )
}

export function solutionsForExactTrigRoots(
  fn: TrigoFunctionName,
  roots: ExactTrigoValue[],
) {
  return uniqueSortedTrigoAngles(
    roots.flatMap((root) => baseSolutionsForExactTrigValue(fn, root)),
  )
}

export class TrigoExact {
  static readonly angles = trigoCircleAngles

  static values(angle: number | FractionEtendue): TrigoCircleAngle | undefined {
    return exactTrigValuesForAngle(angle)
  }

  static solveExact(
    fn: TrigoFunctionName,
    value: ExactTrigoValueKey,
  ): TrigoCircleAngle[] {
    return anglesForExactTrigValue(fn, value)
  }

  static solveSquared(
    fn: SinCosTrigoFunctionName,
    squaredValue: ExactSquaredTrigValueKey,
  ): TrigoCircleAngle[] {
    const acceptedBySquare: Record<string, ExactTrigoValueKey[]> = {
      '0': ['0'],
      '1/4': ['-1/2', '1/2'],
      '1/2': ['-sqrt(2)/2', 'sqrt(2)/2'],
      '3/4': ['-sqrt(3)/2', 'sqrt(3)/2'],
      '1': ['-1', '1'],
    }
    const key = `${fn}Key` as const
    return trigoCircleAngles.filter((angle) =>
      acceptedBySquare[squaredValue].includes(angle[key]),
    )
  }

  static periodicSolutions(
    fn: TrigoFunctionName,
    value: ExactTrigoValueKey,
    variable = 'x',
  ): string {
    const solutions = this.solveExact(fn, value)
    if (solutions.length === 0) return '\\varnothing'
    return solutions
      .map((solution) => `${variable}=${solution.angleTex}+2k\\pi`)
      .join('\\quad\\text{ou}\\quad ')
  }
}
