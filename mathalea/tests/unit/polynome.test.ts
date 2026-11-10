import Decimal from 'decimal.js'
import { describe, expect, test } from 'vitest'
import { Polynome } from '../../src/lib/mathFonctions/Polynome'
import FractionEtendue from '../../src/modules/FractionEtendue'

const p0 = new Polynome({ coeffs: [0] })
const p1 = new Polynome({ coeffs: [1] })

test('Somme et multiplication de polynômes', () => {
  const p = new Polynome({
    rand: true,
    coeffs: [[10, true], [10, true], [10, true], 0, [10, true]],
  })
  const pp = new Polynome({
    rand: true,
    coeffs: [[10, true], [10, true], [10, true], 0, [10, true]],
  })
  const p2 = p.multiply(p1)
  const p3 = p.add(p0)
  const pFoisPp = p.multiply(pp)
  const ppFoisP = pp.multiply(p)
  const pPlusPp = p.add(pp)
  const ppPlusP = pp.add(p)
  const pMoinsPp = p.add(pp.multiply(-1))
  const ppMoinsP = pp.add(p.multiply(-1))

  // logIfDebug(`pMoinsPP = ${JSON.stringify(pMoinsPp)}`)
  // logIfDebug(`ppMoinsP = ${JSON.stringify(ppMoinsP)}`)
  expect(p.isEqual(p2)).toBe(true)
  expect(p.isEqual(p3)).toBe(true)
  expect(p3.isEqual(p2)).toBe(true)
  expect(pFoisPp.isEqual(ppFoisP)).toBe(true)
  expect(pPlusPp.isEqual(ppPlusP)).toBe(true)
  expect(pMoinsPp.isEqual(ppMoinsP.multiply(-1))).toBe(true)
  expect(p.primitive0().derivee().isEqual(p)).toBe(true)
})

describe('calcul rationnel exact des polynômes', () => {
  const frac = (n: number, d = 1) => new FractionEtendue(n, d)
  const coefficients = (p: Polynome) =>
    p.monomes.map((c) => {
      expect(c).toBeInstanceOf(FractionEtendue)
      const value = c as FractionEtendue
      return [value.num, value.den]
    })

  test('normalise sans modifier le tableau ni la variable et garde les petits coefficients non nuls', () => {
    const input = [frac(2, 4), 0, frac(1, 10_000_000), frac(0), 0]
    const p = Polynome.fromRationalCoefficients(input, 't')
    expect(coefficients(p)).toEqual([
      [1, 2],
      [0, 1],
      [1, 10_000_000],
    ])
    expect(p.deg).toBe(2)
    expect(p.letter).toBe('t')
    expect(input).toHaveLength(5)
    expect((input[0] as FractionEtendue).num).toBe(2)
  })

  test.each([[], [0, 0], [frac(0), frac(0)]])(
    'représente le polynôme nul (%j)',
    (...input) => {
      const p = Polynome.fromRationalCoefficients(input)
      expect(p.deg).toBe(0)
      expect(p.evaluateExact(2).isEqual(frac(0))).toBe(true)
      expect(coefficients(p)).toEqual([[0, 1]])
    },
  )

  test('copie les nombres et Decimal en fractions, sans modifier le polynôme de départ', () => {
    const original = new Polynome({
      coeffs: [0.1, new Decimal('0.125'), 0],
      useDecimal: true,
      letter: 'u',
    })
    const p = original.toRational()
    expect(coefficients(p)).toEqual([
      [1, 10],
      [1, 8],
    ])
    expect(p.letter).toBe('u')
    expect(original.deg).toBe(2)
    expect(original.monomes[0]).toBe(0.1)
    expect(original.monomes[1]).toBeInstanceOf(Decimal)
  })

  test('calcule le carré de 2x/3 sans conversion intermédiaire en flottant', () => {
    const p = Polynome.fromRationalCoefficients([0, frac(2, 3)], 't')
    const squared = p.multiplyExact(p)
    expect(coefficients(squared)).toEqual([
      [0, 1],
      [0, 1],
      [4, 9],
    ])
    expect(squared.letter).toBe('t')
    expect(squared.evaluateExact(3).isEqual(frac(4))).toBe(true)
    expect(coefficients(p)).toEqual([
      [0, 1],
      [2, 3],
    ])
  })

  test('multiplie deux polynômes à coefficients fractionnaires signés', () => {
    const p = Polynome.fromRationalCoefficients([frac(1, 2), frac(1, 3)])
    const q = Polynome.fromRationalCoefficients([frac(2, 5), frac(-3, 7)])
    expect(coefficients(p.multiplyExact(q))).toEqual([
      [1, 5],
      [-17, 210],
      [-1, 7],
    ])
    expect(coefficients(q.multiplyExact(p))).toEqual(
      coefficients(p.multiplyExact(q)),
    )
  })

  test('multiplie par un entier, un décimal, une fraction et zéro', () => {
    const p = Polynome.fromRationalCoefficients([frac(1, 3), frac(2, 3)])
    expect(coefficients(p.multiplyExact(-1))).toEqual([
      [-1, 3],
      [-2, 3],
    ])
    expect(coefficients(p.multiplyExact(new Decimal('0.5')))).toEqual([
      [1, 6],
      [1, 3],
    ])
    expect(coefficients(p.multiplyExact(frac(3, 2)))).toEqual([
      [1, 2],
      [1, 1],
    ])
    expect(p.multiplyExact(0).deg).toBe(0)
    expect(coefficients(p.multiplyExact(0))).toEqual([[0, 1]])
  })

  test('évalue exactement en une borne rationnelle négative ou décimale', () => {
    const p = Polynome.fromRationalCoefficients([
      frac(1, 6),
      frac(-2, 3),
      frac(4, 9),
    ])
    for (const x of [frac(-3, 2), -1.5, new Decimal('-1.5')]) {
      expect(p.evaluateExact(x).isEqual(frac(13, 6))).toBe(true)
    }
    expect(p.evaluateExact(0).isEqual(frac(1, 6))).toBe(true)
  })

  test('refuse les conversions non finies ou dépassant la précision entière disponible', () => {
    for (const c of [
      Infinity,
      NaN,
      new Decimal('1e30'),
      new Decimal('1e-30'),
    ]) {
      expect(() => Polynome.fromRationalCoefficients([c])).toThrow(RangeError)
    }
  })
})
