// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { seq } from './combinators'
import {
  isEquivalentInequality,
  sameIntervalCondition,
} from './inequalityChecks'

describe('inequality checks', () => {
  describe('isEquivalentInequality', () => {
    const compare = seq([isEquivalentInequality()])

    it('accepts an equivalent inequality', () => {
      expect(compare('2x<6', 'x<3').isOk).toBe(true)
      expect(compare('-x>-3', 'x<3').isOk).toBe(true)
      expect(compare('x\\leqslant 3', 'x\\le3').isOk).toBe(true)
    })

    it('rejects a different inequality', () => {
      expect(compare('x>3', 'x<3').isOk).toBe(false)
      expect(compare('x\\leqslant 3', 'x<3').isOk).toBe(false)
      expect(compare('x=3', 'x<3').isOk).toBe(false)
    })
  })

  describe('sameIntervalCondition', () => {
    const compare = seq([sameIntervalCondition()])

    it('accepts a single inequality written either way', () => {
      expect(compare('x>3', 'x>3').isOk).toBe(true)
      expect(compare('3<x', 'x>3').isOk).toBe(true)
      expect(compare('x\\le5', 'x\\leqslant 5').isOk).toBe(true)
      expect(compare('5\\geq x', 'x\\leqslant 5').isOk).toBe(true)
      expect(compare('x≤5', 'x\\leqslant 5').isOk).toBe(true)
      expect(compare('x<\\frac{1}{2}', 'x<0.5').isOk).toBe(true)
    })

    it('accepts a double inequality written either way', () => {
      expect(compare('-3<x\\leqslant 5', '-3<x\\leqslant 5').isOk).toBe(true)
      expect(compare('5\\geqslant x>-3', '-3<x\\leqslant 5').isOk).toBe(true)
      expect(compare('-3<x\\le5', '-3<x\\leqslant 5').isOk).toBe(true)
      expect(compare('-\\infty<x\\leqslant 5', 'x\\leqslant 5').isOk).toBe(true)
    })

    it('reports a wrong strictness', () => {
      expect(
        compare('-3\\leqslant x\\leqslant 5', '-3<x\\leqslant 5'),
      ).toMatchObject({
        isOk: false,
        feedback: 'Il y a une erreur avec le symbole en $-3$.',
      })
    })

    it('reports a wrong bound', () => {
      expect(compare('-2<x\\leqslant 5', '-3<x\\leqslant 5')).toMatchObject({
        isOk: false,
        feedback: 'Il y a une erreur avec la valeur $-2$.',
      })
      expect(compare('x\\leqslant 5', '-3<x\\leqslant 5')).toMatchObject({
        isOk: false,
        feedback: 'Il manque une inégalité.',
      })
      expect(compare('x>3', 'x<3').isOk).toBe(false)
    })

    it('reports inconsistent directions', () => {
      expect(compare('-3<x>5', '-3<x\\leqslant 5')).toMatchObject({
        isOk: false,
        feedback: 'Les deux inégalités ne sont pas dans le même sens.',
      })
    })

    it('rejects input that is not an inequality on x', () => {
      for (const input of ['5', ']-3;5]', 'y<3', 'x<y', '-3<5<x']) {
        expect(compare(input, '-3<x\\leqslant 5')).toMatchObject({
          isOk: false,
          feedback: 'Écrire une inégalité ou un encadrement.',
        })
      }
    })
  })
})
