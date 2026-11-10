// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { all } from './combinators'
import { coefficientsAffines, sameAffineSignTable } from './sameAffineSignTable'

describe('sameAffineSignTable', () => {
  const compare = all([sameAffineSignTable()])

  it('accepte toute fonction affine ayant la même racine et le même sens de variation', () => {
    for (const saisie of [
      '-x+3',
      '-2x+6',
      '-2(x-3)',
      '6-2x',
      '-\\frac{1}{2}x+\\frac{3}{2}',
      '-0{,}5x+1{,}5',
      'f(x)=-3x+9',
    ]) {
      expect(compare(saisie, '-x+3')).toMatchObject({ isOk: true, score: 1 })
    }
  })

  it('refuse une autre racine ou un coefficient directeur de signe contraire', () => {
    for (const saisie of ['x-3', '-x-3']) {
      expect(compare(saisie, '-x+3')).toMatchObject({
        isOk: false,
        feedback: 'Cette fonction affine ne convient pas.',
      })
    }
  })

  it('refuse une expression non affine', () => {
    for (const saisie of ['-x^2+9', '3', '']) {
      expect(compare(saisie, '-x+3')).toMatchObject({
        isOk: false,
        feedback: 'La réponse doit être de la forme $ax+b$ avec $a\\neq 0$.',
      })
    }
  })

  it('lit les coefficients a et b', () => {
    expect(coefficientsAffines('\\frac{x-3}{2}')).toEqual([0.5, -1.5])
    expect(coefficientsAffines('x^2')).toBeUndefined()
  })
})
