import { describe, expect, it } from 'vitest'
import AsymptotesEtTableauDeVariations from '../../src/exercices/TSpe/TSA2-11'

describe('TSA2-11 : nombre de questions', () => {
  it.each([1, 2, 3].flatMap((type) => [1, 3, 5].map((count) => [type, count])))(
    'génère le type %i en %i questions',
    (type, count) => {
      const exercice = new AsymptotesEtTableauDeVariations()
      exercice.sup = type
      exercice.nbQuestions = count
      exercice.interactif = true
      exercice.nouvelleVersion()

      expect(exercice.listeQuestions).toHaveLength(count)
      expect(exercice.listeCorrections).toHaveLength(count)
      expect(exercice.autoCorrection).toHaveLength(count)
      expect(exercice.sup).toBe(type)
      for (const question of exercice.autoCorrection) {
        expect(question.propositions).toHaveLength(4)
        expect(question.propositions?.filter((p) => p.statut)).toHaveLength(1)
        if (type === 1) {
          expect(question.propositions?.find((p) => p.statut)?.texte).toContain(
            'asymptote horizontale',
          )
        } else if (type === 2) {
          expect(question.propositions?.find((p) => p.statut)?.texte).toContain(
            'asymptote verticale',
          )
        }
      }
    },
  )
})
