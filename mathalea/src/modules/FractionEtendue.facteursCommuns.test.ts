import { describe, expect, it } from 'vitest'
import FractionEtendue from './FractionEtendue'

describe('texSimplificationParFacteursCommuns', () => {
  it('dégage et barre les facteurs communs sans décomposition première', () => {
    const fraction = new FractionEtendue(6 * 7, 12 * 63)
    expect(fraction.texSimplificationParFacteursCommuns([6, 7], [12, 63])).toBe(
      '=\\dfrac{6\\times 7}{12\\times 63}=\\dfrac{6\\times 7}{6\\times 2\\times 7\\times 9}=\\dfrac{\\cancel{6}\\times \\cancel{7}}{\\cancel{6}\\times 2\\times \\cancel{7}\\times 9}=\\dfrac{1}{18}',
    )
  })

  it('continue avec plusieurs facteurs communs inférieurs à 12', () => {
    const correction = new FractionEtendue(
      12,
      24,
    ).texSimplificationParFacteursCommuns([12], [24])
    expect(correction).toContain('\\cancel{6}\\times \\cancel{2}')
    expect(correction).toContain('\\cancel{6}\\times \\cancel{2}\\times 2')
    expect(correction).toMatch(/=\\dfrac\{1\}\{2\}$/)
  })

  it('utilise aussi un multiple de 10 visible dans les produits', () => {
    const correction = new FractionEtendue(
      6 * 20,
      40 * 18,
    ).texSimplificationParFacteursCommuns([6, 20], [40, 18])
    expect(correction).toContain(
      '\\dfrac{6\\times 20}{20\\times 2\\times 6\\times 3}',
    )
    expect(correction).toContain('\\cancel{20}')
    expect(correction).toContain('\\cancel{6}')
  })

  it('refuse de masquer un facteur commun supérieur à la borne', () => {
    expect(() =>
      new FractionEtendue(13, 26).texSimplificationParFacteursCommuns(
        [13],
        [26],
      ),
    ).toThrow('Aucun diviseur commun inférieur à 12 ou multiple de 10')
  })
})
