// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { all, isEqual, isReduced } from '../../src/lib/interactif/checks'

describe('2L12-5 : développer et réduire', () => {
  const compare = all([isEqual(), isReduced()])
  const attendu = '64x^2+80x+25'

  it('accepte la forme développée et réduite', () => {
    expect(compare('64x^2+80x+25', attendu).isOk).toBe(true)
    expect(compare('25+80x+64x^2', attendu).isOk).toBe(true)
  })

  it('refuse une expression équivalente non développée', () => {
    expect(compare('(8x+5)(8x+5)', attendu).isOk).toBe(false)
    expect(compare('(8x+5)^2', attendu).isOk).toBe(false)
  })

  it('refuse une expression développée mais non réduite', () => {
    expect(compare('64x^2+40x+40x+25', attendu).isOk).toBe(false)
  })

  it('refuse une expression réduite mais non équivalente', () => {
    expect(compare('64x^2+25', attendu).isOk).toBe(false)
  })

  it('accepte une forme réduite dans un autre ordre, au format MathLive', () => {
    expect(compare('9+49x^{2}+42x', '49x^2+42x+9').isOk).toBe(true)
    expect(compare('42x+9+49x^2', '49x^2+42x+9').isOk).toBe(true)
  })

  it('refuse un produit saisi avec les parenthèses MathLive', () => {
    expect(
      compare('\\lparen x-4\\rparen\\lparen x-4\\rparen', 'x^2-8x+16').isOk,
    ).toBe(false)
  })
})
