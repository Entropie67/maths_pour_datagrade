import { expect } from '@playwright/test'
import { describe, it } from 'vitest'
import { deparenthise } from '../../src/lib/mathFonctions/EnleverParenthesesInutiles'

/**
 * ⚙️ Helper : retire les espaces pour comparaison lisible
 */
function norm(latex: string): string {
  return latex.replace(/\s+/g, '')
}

describe('deparenthise()', () => {
  describe('Parenthèses simples', () => {
    it('supprime les parenthèses inutiles', () => {
      expect(norm(deparenthise('3+(4\\times2)'))).toBe('3+4\\times2')
    })

    it('supprime les parenthèses inutiles', () => {
      expect(norm(deparenthise('(+3)+(+4)'))).toBe('3+4')
    })

    it('supprime les parenthèses inutiles', () => {
      expect(
        norm(deparenthise('$ \\ldots\\ldots\\ldots + (-3,3) = (+5,6) $')),
      ).toBe('$\\ldots\\ldots\\ldots+(-3,3)=5,6$')
    })

    it('supprime les parenthèses inutiles', () => {
      expect(norm(deparenthise('(+3)+(-4)'))).toBe('3+(-4)')
    })

    it('conserve les parenthèses utiles', () => {
      expect(norm(deparenthise('(3+4)\\times2'))).toBe('(3+4)\\times2')
    })

    it('conserve les \\div explicites', () => {
      expect(norm(deparenthise('3+(4\\div2)'))).toBe('3+4\\div2')
    })

    it('conserve les \\div explicites', () => {
      expect(norm(deparenthise('11\\div(3+8)'))).toBe('11\\div(3+8)')
    })

    it('conserve les \\div explicites', () => {
      expect(norm(deparenthise('(12\\div3)+8'))).toBe('12\\div3+8')
    })

    it('conserve les \\div explicites', () => {
      expect(norm(deparenthise('8+(9\\times(6\\div3))'))).toBe(
        '8+9\\times(6\\div3)',
      )
    })
  })

  describe('Produits et divisions négatives', () => {
    it('affiche 5×(-3) quand facteur négatif non premier', () => {
      expect(norm(deparenthise('5\\times-3'))).toBe('5\\times(-3)')
    })

    it('affiche -14×11 sans parenthèse pour premier facteur négatif', () => {
      expect(
        norm(deparenthise('\\dfrac{(-14)\\times(+11)}{(+11)\\times(+12)}')),
      ).toBe('\\dfrac{-14\\times11}{11\\times12}')
    })

    it('affiche 5÷(-3) pour division négative', () => {
      expect(norm(deparenthise('5\\div-3'))).toBe('5\\div(-3)')
    })

    it('affiche \\dfrac{-9}{5\\times(-16)} pour dénominateur avec facteur négatif', () => {
      expect(norm(deparenthise('\\dfrac{(-9)}{(+5)\\times(-16)}'))).toBe(
        '\\dfrac{-9}{5\\times(-16)}',
      )
    })
  })

  describe('Fractions et \\dfrac / \\frac', () => {
    it('laisse \\frac inchangé', () => {
      expect(norm(deparenthise('\\frac{4}{2}'))).toBe('\\frac{4}{2}')
    })

    it('convertit \\dfrac en \\dfrac en sortie', () => {
      expect(norm(deparenthise('\\dfrac{4}{2}'))).toBe('\\dfrac{4}{2}')
    })

    it('accepte \\dfrac avec produits et signes complexes', () => {
      const input = '\\dfrac{(-4)\\times(+9)}{(-18)\\times(+9)}'
      const output = '\\dfrac{-4\\times9}{-18\\times9}'
      expect(norm(deparenthise(input))).toBe(norm(output))
    })

    it('conserve \\div pour divisions simples', () => {
      expect(norm(deparenthise('3\\div2'))).toBe('3\\div2')
    })

    it('convertit \\dfrac{(+4)}{(-8)} en \\dfrac{4}{-8}', () => {
      expect(norm(deparenthise('\\dfrac{(+4)}{(-8)}'))).toBe('\\dfrac{4}{-8}')
    })
  })
})
