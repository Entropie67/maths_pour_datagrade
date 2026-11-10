// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { seq } from './combinators'
import { noFraction } from './noFraction'

const compare = seq([noFraction()])

describe('noFraction', () => {
  it('refuse les traits de fraction', () => {
    expect(compare('\\frac{1}{2}', 'x').isOk).toBe(false)
    expect(compare('\\dfrac{1}{2}', 'x').isOk).toBe(false)
    expect(compare('6\\div2', 'x').isOk).toBe(false)
    expect(compare('6/2', 'x').isOk).toBe(false)
  })

  it('accepte une saisie sans fraction', () => {
    expect(compare('x^2(-4+6x)', 'x').isOk).toBe(true)
    expect(compare('x^{10}', 'x').isOk).toBe(true)
  })
})
