// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { seq } from './combinators'
import { sameGeometricName } from './sameGeometricName'

const compare = seq([sameGeometricName()])
const accepted = (saisie: string, answer: string) =>
  expect(compare(saisie, answer).isOk, `${saisie} pour ${answer}`).toBe(true)
const refused = (saisie: string, answer: string, feedback?: string) => {
  const result = compare(saisie, answer)
  expect(result.isOk, `${saisie} pour ${answer}`).toBe(false)
  if (feedback != null) expect(result.feedback).toContain(feedback)
}

describe('sameGeometricName', () => {
  it('compares segments and lines in any order', () => {
    accepted('[AB]', '[AB]')
    accepted('[BA]', '[AB]')
    accepted('\\left(BA\\right)', '(AB)')
    accepted('\\lbrack A B\\rbrack', '[AB]')
    refused('[AC]', '[AB]')
    refused('(AB)', '[AB]', 'crochets')
    refused('[AB]', '(AB)', 'parenthèses')
  })

  it('keeps the origin of a ray first', () => {
    accepted('[AB)', '[AB)')
    refused('[BA)', '[AB)')
    refused('[AB]', '[AB)', 'demi-droite')
  })

  it('checks the vertex of an angle', () => {
    accepted('\\widehat{XHB}', '\\widehat{XHB}')
    accepted('\\widehat{BHX}', '\\widehat{XHB}')
    refused('\\widehat{HXB}', '\\widehat{XHB}', 'sommet')
    refused('\\widehat{XXX}', '\\widehat{XHB}', 'distincts')
    refused('XHB', '\\widehat{XHB}', 'chapeau')
  })

  it('accepts the vertices of a triangle in any order', () => {
    accepted('CAB', 'ABC')
    refused('AAB', 'ABC', 'distincts')
    refused('ABD', 'ABC')
  })

  it('reads primes and indices in point names', () => {
    accepted("[B'A']", "[A'B']")
    accepted('[A^{\\prime}B]', "[A'B]")
    accepted('\\widehat{A_1OB}', '\\widehat{BOA_1}')
    refused('[AB]', "[A'B]")
  })
})
