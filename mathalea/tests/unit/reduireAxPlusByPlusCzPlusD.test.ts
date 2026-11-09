import { describe, expect, it } from 'vitest'
import { reduireAxPlusByPlusCzPlusD } from '../../src/lib/outils/ecritures'

describe('reduireAxPlusByPlusCzPlusD', () => {
  it('écrit les termes non nuls sans coefficient 1', () => {
    expect(reduireAxPlusByPlusCzPlusD(3, -4, 5, -6)).toBe('3x-4y+5z-6')
    expect(reduireAxPlusByPlusCzPlusD(1, -1, 0, 0)).toBe('x-y')
    expect(reduireAxPlusByPlusCzPlusD(0, 2, -1, 7)).toBe('2y-z+7')
    expect(reduireAxPlusByPlusCzPlusD(-1, 1, 1, 0)).toBe('-x+y+z')
  })

  it('gère les cas où presque tout est nul', () => {
    expect(reduireAxPlusByPlusCzPlusD(0, 0, 1, 0)).toBe('z')
    expect(reduireAxPlusByPlusCzPlusD(0, 0, 0, -4)).toBe('-4')
    expect(reduireAxPlusByPlusCzPlusD(0, 0, 0, 0)).toBe('0')
  })

  it("accepte d'autres lettres", () => {
    expect(
      reduireAxPlusByPlusCzPlusD(2, 0, -1, 3, 'x_H', 'y_H', 'z_H'),
    ).toBe('2x_H-z_H+3')
  })
})
