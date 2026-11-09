import seedrandom from 'seedrandom'
import { describe, expect, it } from 'vitest'
import Exercice5N3B2 from '../../src/exercices/5e/5N3B-2'
import { setOutputHtml } from '../../src/modules/context'

describe('5N3B-2', () => {
  it('garde le dénominateur de la fraction simplifiée dans la correction', () => {
    setOutputHtml()
    for (const graine of ['a', 'b', 'c', 'd', 'e']) {
      seedrandom(graine, { global: true })
      const exercice = new Exercice5N3B2()
      exercice.sup3 = true
      exercice.nbQuestions = 4
      exercice.nouvelleVersion()
      expect(exercice.listeCorrections.join('')).not.toContain('}{}')
    }
  })
})
