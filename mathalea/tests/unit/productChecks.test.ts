import { describe, expect, it } from 'vitest'
import {
  isPrimeFactorization,
  onlyProduct,
} from '../../src/lib/interactif/checks'

const passe = (check: ReturnType<typeof onlyProduct>, saisie: string) =>
  check.run(saisie, '').passed

describe('onlyProduct', () => {
  it.each([
    '90',
    '9\\times10',
    '2\\times3^{2}\\times5',
    '2\\times3^2\\times5',
    '(2\\times3)\\times 15',
    '2\\cdot45',
  ])('accepte %s', (saisie) => {
    expect(passe(onlyProduct(), saisie)).toBe(true)
  })

  it.each([
    '80+10',
    '100-10',
    '\\frac{180}{2}',
    '2\\times',
    '2\\times3+5',
    '',
    'x\\times3',
  ])('refuse %s', (saisie) => {
    expect(passe(onlyProduct(), saisie)).toBe(false)
  })
})

describe('isPrimeFactorization', () => {
  it.each(['2^{3}\\times3^{2}\\times5', '2\\times2\\times3', '7'])(
    'accepte %s',
    (saisie) => {
      expect(passe(isPrimeFactorization(), saisie)).toBe(true)
    },
  )

  it.each(['4\\times3', '12', '2+3', '1\\times2', '2^{3}\\times9'])(
    'refuse %s',
    (saisie) => {
      expect(passe(isPrimeFactorization(), saisie)).toBe(false)
    },
  )
})
