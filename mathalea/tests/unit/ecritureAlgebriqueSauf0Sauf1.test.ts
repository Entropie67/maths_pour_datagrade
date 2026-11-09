import { describe, expect, it } from 'vitest'
import { ecritureAlgebriqueSauf0Sauf1 } from '../../src/lib/outils/ecritures'
import FractionEtendue from '../../src/modules/FractionEtendue'

describe('ecritureAlgebriqueSauf0Sauf1', () => {
  it('omet le terme nul et le coefficient 1', () => {
    expect(ecritureAlgebriqueSauf0Sauf1(0)).toBe('')
    expect(ecritureAlgebriqueSauf0Sauf1(1)).toBe('+')
    expect(ecritureAlgebriqueSauf0Sauf1(-1)).toBe('-')
    expect(ecritureAlgebriqueSauf0Sauf1(3)).toBe('+3')
    expect(ecritureAlgebriqueSauf0Sauf1(-3)).toBe('-3')
  })

  it('accepte les fractions', () => {
    expect(ecritureAlgebriqueSauf0Sauf1(new FractionEtendue(0, 5))).toBe('')
    expect(ecritureAlgebriqueSauf0Sauf1(new FractionEtendue(1, 1))).toBe('+')
    expect(ecritureAlgebriqueSauf0Sauf1(new FractionEtendue(-3, 4))).toBe(
      '-\\dfrac{3}{4}',
    )
  })
})
