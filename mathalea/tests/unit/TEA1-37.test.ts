import seedrandom from 'seedrandom'
import { describe, expect, it } from 'vitest'
import ShortCongruenceRemainder from '../../src/exercices/TEx/TEA1-37'
import { context } from '../../src/modules/context'

describe('TEA1-37 — restes de grandes puissances', () => {
  it('donne le reste exact pour les différentes congruences tirées', () => {
    const originalRandom = Math.random
    const originalHtml = context.isHtml
    try {
      context.isHtml = true
      for (let seed = 0; seed < 270; seed++) {
        seedrandom(`congruence-${seed}`, { global: true })
        const exercise = new ShortCongruenceRemainder()
        exercise.interactif = true
        exercise.nouvelleVersion()
        expect(exercise.listeQuestions).toHaveLength(3)
        for (let index = 0; index < 3; index++) {
          const match = exercise.listeQuestions[index].match(
            /\$(\d+)\^\{(\d+)\}\$ par \$(\d+)\$/,
          )!
          expect(match).not.toBeNull()
          const [, base, exponent, modulus] = match
          // Calcul indépendant en entiers exacts, sans utiliser la congruence du corrigé.
          const expected = Number(
            BigInt(base) ** BigInt(exponent) % BigInt(modulus),
          )
          expect(
            Number(exercise.autoCorrection[index].valeur?.reponse?.value),
          ).toBe(expected)
          expect(exercise.listeCorrections[index]).not.toContain('inverse')
          expect(exercise.listeCorrections[index]).not.toContain('+0')
          expect(exercise.listeCorrections[index]).not.toContain('^{0}')
        }
      }
    } finally {
      Math.random = originalRandom
      context.isHtml = originalHtml
    }
  })
})
