import { describe, it, expect } from 'vitest'
import { Ratio } from '../../src/lib/mathFonctions/Ratio'

describe('Ratio class', () => {
  it('calculates total and percentages correctly', () => {
    const ratio = new Ratio([3, 4, 5])
    expect(ratio.total()).toBe(12)

    const percentages = ratio.percentages()
    expect(percentages[0]).toBeCloseTo(25)
    expect(percentages[1]).toBeCloseTo(33.33, 1)
    expect(percentages[2]).toBeCloseTo(41.66, 1)
  })

  it('updates ratio proportionally when setValue is called', () => {
    const ratio = new Ratio([3, 4, 5])
    ratio.setValue(0, 6)
    expect(ratio.values).toEqual([6, 8, 10])
  })

  it('normalizes ratios with integers', () => {
    const ratio = new Ratio([6, 8, 10])
    expect(ratio.normalized()).toEqual([3, 4, 5])
  })

  it('normalizes ratios with decimals', () => {
    const ratio = new Ratio([1.5, 3, 4.5])
    expect(ratio.normalized()).toEqual([1, 2, 3])
  })

  it('detects proportionality with epsilon', () => {
    const ratio1 = new Ratio([1.5, 3, 4.5])
    const ratio2 = new Ratio([3, 6, 9])
    expect(ratio1.isProportionalTo(ratio2)).toBe(true)
  })

  it('compares ratios with floating point tolerance', () => {
    const ratio1 = new Ratio([1.000001, 2.000001])
    const ratio2 = new Ratio([1, 2])
    expect(ratio1.equals(ratio2, 1e-5)).toBe(true)
    expect(ratio1.equals(ratio2, 1e-8)).toBe(false)
  })

  it('scales and adjusts total', () => {
    const ratio = new Ratio([2, 3, 5])
    ratio.adjustToTotal(100)
    expect(ratio.total()).toBeCloseTo(100)
    const totalPercentage = ratio.percentages().reduce((a, b) => a + b, 0)
    expect(totalPercentage).toBeCloseTo(100)
  })

  it('exports and imports via JSON', () => {
    const ratio = new Ratio([3, 4, 5])
    const json = ratio.toJSON()
    const newRatio = Ratio.fromJSON(json)
    expect(newRatio.values).toEqual([3, 4, 5])
  })

  it('exports to LaTeX format', () => {
    const ratio = new Ratio([3, 4, 5])
    expect(ratio.toLatex()).toBe('3 : 4 : 5')
  })

  it('throws error on invalid ratio creation', () => {
    expect(() => new Ratio([0, 1])).toThrow()
    expect(() => new Ratio([1])).toThrow()
    expect(() => new Ratio([Infinity, 2])).toThrow()
  })

  it('throws error on invalid setValue usage', () => {
    const ratio = new Ratio([3, 4, 5])
    expect(() => ratio.setValue(-1, 5)).toThrow()
    expect(() => ratio.setValue(3, 5)).toThrow()
    expect(() => ratio.setValue(1, 0)).toThrow()
  })
})
