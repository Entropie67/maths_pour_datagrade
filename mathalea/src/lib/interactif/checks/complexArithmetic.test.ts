import { describe, expect, it } from 'vitest'
import {
  evaluateComplexExpression,
  haveSameComplexValue,
} from './complexArithmetic'
import { isEquivalentEquation } from './equationChecks'

describe('evaluateComplexExpression', () => {
  it.each([
    ['2+3i', { re: 2, im: 3 }],
    ['(2+3i)(1-i)', { re: 5, im: 1 }],
    ['2\\mathrm{i}', { re: 0, im: 2 }],
    ['2\\imaginaryI', { re: 0, im: 2 }],
    ['i^2', { re: -1, im: 0 }],
    ['i^{3}', { re: 0, im: -1 }],
    ['\\dfrac{1+5i}{13}', { re: 1 / 13, im: 5 / 13 }],
    ['\\frac{1}{2+i}', { re: 0.4, im: -0.2 }],
    ['\\overline{2+3i}', { re: 2, im: -3 }],
    ['-(1+i)', { re: -1, im: -1 }],
    ['2{,}5-1,5i', { re: 2.5, im: -1.5 }],
    ['(2+3i)\\times(1-i)', { re: 5, im: 1 }],
  ])('évalue %s', (expression, attendu) => {
    const valeur = evaluateComplexExpression(expression)
    expect(valeur?.re).toBeCloseTo(attendu.re)
    expect(valeur?.im).toBeCloseTo(attendu.im)
  })

  it('évalue une variable complexe', () => {
    const valeur = evaluateComplexExpression('(1+i)z', {
      z: { re: 1, im: 2 },
    })
    expect(valeur).toEqual({ re: -1, im: 3 })
  })

  it.each(['', '2+', '(1+i', '\\sqrt{2}', '1/0', 'z'])(
    'renvoie undefined pour %j',
    (expression) => {
      expect(evaluateComplexExpression(expression)).toBeUndefined()
    },
  )
})

describe('haveSameComplexValue', () => {
  it('compare des écritures différentes du même complexe', () => {
    expect(
      haveSameComplexValue('\\dfrac{1+5i}{13}', '\\frac{(-1+i)(2-3i)}{13}'),
    ).toBe(true)
    expect(haveSameComplexValue('\\dfrac{1+5i}{13}', '\\dfrac{1-5i}{13}')).toBe(
      false,
    )
  })
})

describe('isEquivalentEquation avec complexes', () => {
  const check = isEquivalentEquation({ complexes: true })
  const passe = (saisie: string, attendu: string) =>
    check.run(saisie, attendu).passed

  it.each([
    ['(2+3i)z+1-i=0', '(2+3i)z=-1+i'],
    ['(2 + 3i)z-4 + 5i=0', '(2+3\\mathrm{i})z=4-5i'],
    ['(2+3i)z=-1+i', 'z=\\frac{-1+i}{2+3i}'],
    ['(2+3i)z=-1+i', 'z=\\frac{(-1+i)(2-3i)}{(2+3i)(2-3i)}'],
    ['(2+3i)z=-1+i', 'z=\\frac{1+5i}{13}'],
    ['(2+3i)z=-1+i', 'z=\\frac{1}{13}+\\frac{5}{13}\\mathrm{i}'],
    ['(2+3i)z=-1+i', '(4+6i)z=-2+2i'],
    // Touches ( et ) du clavier virtuel
    ['(-9 - 17i)z+3 - 10i=0', '\\lparen-9-17i\\rparen z=10i-3'],
    [
      '(-9 - 17i)z+3 - 10i=0',
      '\\left(-9-17\\mathrm{i}\\right)z=10\\mathrm{i}-3',
    ],
  ])('%s est équivalente à %s', (saisie, attendu) => {
    expect(passe(saisie, attendu)).toBe(true)
  })

  it.each([
    ['(2+3i)z=-1+i', '(2+3i)z=1-i'],
    ['(2+3i)z=-1+i', 'z=\\frac{-1+i}{2-3i}'],
    ['(2+3i)z=-1+i', 'z=\\frac{2}{13}+\\frac{5}{13}i'],
    ['(2+3i)z=-1+i', 'z=0'],
    ['(2+3i)z=-1+i', '(2+3i)z=-1+i=0'],
  ])("%s n'est pas équivalente à %s", (saisie, attendu) => {
    expect(passe(saisie, attendu)).toBe(false)
  })

  it("reste inchangée sans l'option complexes (i est alors une lettre)", () => {
    expect(
      isEquivalentEquation().run('(2+3i)z=-1+i', 'z=\\frac{1+5i}{13}').passed,
    ).toBe(false)
  })
})
