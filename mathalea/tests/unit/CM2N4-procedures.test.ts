import { describe, expect, it } from 'vitest'
import type Exercice from '../../src/exercices/Exercice'
import { context } from '../../src/modules/context'

describe.each([
  'CM2N4I',
  'CM2N4J-3',
  'CM2N4K',
  'CM2N4L',
  'CM2N4M',
  'CM2N4N-1',
  'CM2N4O',
  'CM2N4P',
  'CM2N4Q',
])('%s', (code) => {
  it.each([true, false])(
    'génère des questions complètes dont la correction met en évidence la réponse attendue (interactif : %s)',
    async (interactif) => {
      const { default: Classe } = await import(
        `../../src/exercices/CM2/${code}.ts`
      )
      context.isHtml = true
      for (let graine = 0; graine < 30; graine++) {
        const exercice: Exercice = new Classe()
        exercice.numeroExercice = 0
        exercice.interactif = interactif
        exercice.seed = `graine${graine}`
        exercice.nouvelleVersion()
        expect(exercice.listeQuestions).toHaveLength(exercice.nbQuestions)
        expect(exercice.listeCorrections).toHaveLength(exercice.nbQuestions)
        for (let i = 0; i < exercice.nbQuestions; i++) {
          const attendue = Number(
            String(exercice.autoCorrection[i].valeur?.reponse.value),
          )
          const miseEnEvidence = exercice.listeCorrections[i].match(
            /\\boldsymbol\{([^}]*)\}/,
          )
          expect(miseEnEvidence).not.toBeNull()
          const affichee = Number(
            (miseEnEvidence as RegExpMatchArray)[1]
              .replace(/\\,/g, '')
              .replace(/\{,\}|,/g, '.'),
          )
          expect(affichee).toBe(attendue)
        }
      }
    },
  )
})
