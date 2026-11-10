// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { seq } from './combinators'
import { sameComparisonSign } from './sameComparisonSign'

const compare = seq([sameComparisonSign()])
const accepted = (saisie: string, answer: string) =>
  expect(compare(saisie, answer).isOk, `${saisie} pour ${answer}`).toBe(true)
const refused = (saisie: string, answer: string) =>
  expect(compare(saisie, answer).isOk, `${saisie} pour ${answer}`).toBe(false)

describe('sameComparisonSign', () => {
  it('accepte le signe attendu, sous toutes ses écritures', () => {
    accepted('<', '<')
    accepted('$<$', '<')
    accepted('>', '>')
    accepted('\\geqslant', '>')
    accepted('\\leq', '<')
    accepted('≤', '<')
    accepted('>=', '>')
    accepted('<=', '<')
  })

  it("refuse l'autre signe et une saisie qui n'est pas un signe", () => {
    refused('>', '<')
    refused('\\leq', '>')
    refused('=', '<')
    refused('', '<')
    refused('a<b', '<')
  })
})
