import { afterEach, expect, it, vi } from 'vitest'
import LimitesEnUnReel from '../../../../src/exercices/TSpe/TSA2-32'
import * as outils from '../../../../src/modules/outils'

afterEach(() => vi.restoreAllMocks())

it.each([
  { point: -3, coefficient: 2, constant: 1 },
  { point: -3, coefficient: -2, constant: 1 },
  { point: 3, coefficient: 2, constant: 1 },
  { point: 3, coefficient: -2, constant: 1 },
])(
  'vérifie les limites du quatrième cas pour %j',
  ({ point, coefficient, constant }) => {
    vi.spyOn(outils, 'randint')
      .mockReturnValueOnce(point)
      .mockReturnValueOnce(coefficient)
      .mockReturnValueOnce(constant)
    const exercice = new LimitesEnUnReel()
    exercice.sup = 4
    exercice.nbQuestions = 1
    exercice.interactif = true
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions[0]).toContain('x^2-9')
    expect(exercice.listeQuestions[0]).toContain('\\{-3;3\\}')
    expect(exercice.listeQuestions[0]).toContain(`x\\to ${point}`)
    const answers = exercice.autoCorrection[0].valeur
    const evaluate = (x: number) => (coefficient * x + constant) / (x * x - 9)
    const negativeRoot = -Math.abs(point)
    const positiveRoot = Math.abs(point)
    expect(answers?.field0?.value).toBe(
      evaluate(negativeRoot - 1e-6) > 0 ? '+\\infty' : '-\\infty',
    )
    expect(answers?.field1?.value).toBe(
      evaluate(negativeRoot + 1e-6) > 0 ? '+\\infty' : '-\\infty',
    )
    expect(exercice.listeQuestions[0]).toContain(`x\\to ${-point}`)
    expect(answers?.field2?.value).toBe(
      evaluate(positiveRoot - 1e-6) > 0 ? '+\\infty' : '-\\infty',
    )
    expect(answers?.field3?.value).toBe(
      evaluate(positiveRoot + 1e-6) > 0 ? '+\\infty' : '-\\infty',
    )
    expect(answers?.bareme?.([1, 1, 1, 1])).toEqual([1, 1])
    const correction = exercice.listeCorrections[0]
    const signSection = correction.indexOf('Étude du signe du dénominateur')
    const negativeSection = correction.indexOf(`Limites en $${negativeRoot}$`)
    const positiveSection = correction.indexOf(`Limites en $${positiveRoot}$`)
    expect(signSection).toBeGreaterThanOrEqual(0)
    expect(signSection).toBeLessThan(correction.indexOf('On factorise'))
    expect(correction.indexOf('On factorise')).toBeLessThan(negativeSection)
    expect(negativeSection).toBeLessThan(positiveSection)
    expect(correction.indexOf('\\lim')).toBeGreaterThan(negativeSection)
    expect(correction.indexOf('Par quotient')).toBeGreaterThan(negativeSection)
    expect(correction.indexOf('Par quotient')).toBeLessThan(positiveSection)
  },
)
