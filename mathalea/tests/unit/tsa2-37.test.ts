import { describe, expect, it } from 'vitest'
import katex from 'katex'
import LimitesQuantiteConjuguee from '../../src/exercices/TSpe/TSA2-37'

describe('TSA2-37 : limites de racines carrées', () => {
  it.each([1, 2, 3])(
    'génère les deux cas avec des limites correctes (opération %i)',
    (operation) => {
      const exercise = new LimitesQuantiteConjuguee()
      exercise.sup2 = operation
      exercise.nbQuestions = 30
      exercise.interactif = true
      exercise.nouvelleVersion()
      expect(exercise.listeQuestions).toHaveLength(30)
      expect(exercise.besoinFormulaireNumerique).toBe(false)
      const cases = new Set<string>()
      exercise.listeQuestions.forEach((question, i) => {
        const expression = question.match(
          /f\(x\)=\\sqrt\{([^}]+)\}([+-])\\sqrt\{([^}]+)\}/,
        )
        expect(expression).not.toBeNull()
        const [, first, operator, second] = expression!
        const quadratic = first.startsWith('x^2')
        expect(second.startsWith('x^2')).toBe(quadratic)
        cases.add(quadratic ? 'quadratic' : 'affine')
        expect(question).not.toContain('suffisamment')
        expect(question).toContain('D_f=')
        expect(exercise.listeCorrections[i]).not.toContain('D_f=')
        expect(exercise.listeCorrections[i]).not.toMatch(/(^|[^\d])1[xt]/)
        expect(exercise.listeCorrections[i]).not.toContain('La seule limite')
        const slope = (radicand: string) => {
          const coefficient = radicand.split('x')[0]
          return coefficient === ''
            ? 1
            : coefficient === '-'
              ? -1
              : Number(coefficient)
        }
        const a = quadratic ? 1 : slope(first)
        const c = quadratic ? 1 : slope(second)
        expect(a).toBe(c)
        expect(first).not.toBe(second)
        if (!quadratic) {
          expect(a * c).toBeGreaterThan(0)
          expect(question).toContain(`x\\to${a > 0 ? '+' : '-'}\\infty`)
        }
        const expected = operator === '+' ? '+\\infty' : '0'
        expect(exercise.autoCorrection[i].valeur?.reponse?.value).toBe(expected)
        if (operator === '-') {
          expect(exercise.listeCorrections[i]).toContain('quantité conjuguée')
        }
        if (operation === 1) expect(operator).toBe('-')
        if (operation === 2) expect(operator).toBe('+')
        for (const math of exercise.listeCorrections[i].matchAll(
          /\$([^$]+)\$/g,
        )) {
          expect(() =>
            katex.renderToString(math[1], { throwOnError: true }),
          ).not.toThrow()
        }
      })
      expect(cases.size).toBe(2)
    },
  )
})
