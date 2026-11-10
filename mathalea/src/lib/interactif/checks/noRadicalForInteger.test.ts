// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { seq } from './combinators'
import { noRadicalForInteger } from './noRadicalForInteger'

const compare = seq([noRadicalForInteger()])

describe('noRadicalForInteger', () => {
  it('refuse une racine carrée quand la réponse est un entier', () => {
    const result = compare('\\sqrt{16}', '4')
    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain('il faut écrire $4$')
  })

  it('accepte la réponse sans racine ou une réponse qui n’est pas un entier', () => {
    expect(compare('4', '4').isOk).toBe(true)
    expect(compare('\\sqrt{2}', '\\sqrt{2}').isOk).toBe(true)
  })
})
