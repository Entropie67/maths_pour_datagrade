import seedrandom from 'seedrandom'
import { describe, expect, it, vi } from 'vitest'
import LireUneAbscisseAvecZoom from '../../src/exercices/6e/6N1H-3'

vi.mock('../../src/lib/renderScratch', () => ({
  renderScratch: vi.fn(() => ''),
}))

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

describe('6N1H-3 : fractions décimales de la correction', () => {
  it.each([1, 2, 3])('conserve le dénominateur au niveau %i', (niveau) => {
    seedrandom('MlvY', { global: true })
    const exercice = new LireUneAbscisseAvecZoom()
    exercice.sup = niveau
    exercice.sup2 = true
    exercice.nbQuestions = 1
    exercice.nouvelleVersion()

    const correction = exercice.listeCorrections[0]
      .split('<br>')[0]
      .replace(/\\,/g, '')
    const fractions = [...correction.matchAll(/\\d?frac\{(\d+)\}\{(\d+)\}/g)]
    expect(fractions).toHaveLength(2)
    expect(fractions.map((fraction) => Number(fraction[2]))).toEqual([
      10 ** niveau,
      10 ** niveau,
    ])
    if (niveau === 2) {
      expect(fractions.map((fraction) => Number(fraction[1]))).toEqual([
        53, 353,
      ])
    }
  })
})
