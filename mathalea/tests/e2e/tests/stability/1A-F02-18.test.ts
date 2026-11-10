import { expect, it } from 'vitest'
import PositionPoint from '../../../../src/exercices/1e/1A-F02-18'

it.each([true, false])(
  'conserve la conclusion sans référence au QCM (sujet original : %s)',
  (original) => {
    const exercice = new PositionPoint()
    exercice.interactif = false
    if (original) exercice.versionAleatoire = exercice.versionOriginale
    exercice.nbQuestions = original ? 1 : 5
    exercice.nouvelleVersion()
    expect(exercice.listeCorrections).toHaveLength(exercice.nbQuestions)
    for (let i = 0; i < exercice.listeCorrections.length; i++) {
      const correction = exercice.listeCorrections[i]
      expect(correction).toContain('On calcule')
      expect(correction).toContain('donc')
      expect(correction).toContain('le point ')
      expect(correction).not.toContain('La bonne réponse est')
      expect(exercice.listeQuestions[i]).not.toContain(
        'On ne peut pas déterminer',
      )
      expect(correction).toContain('la courbe ')
    }
  },
)

it('conserve le QCM en interactif', () => {
  const exercice = new PositionPoint()
  exercice.interactif = true
  exercice.sup3 = true
  exercice.versionAleatoire = exercice.versionOriginale
  exercice.nouvelleVersion()
  expect(exercice.autoCorrection[0].propositions).toHaveLength(4)
  expect(exercice.listeQuestions[0]).toContain('On ne peut pas déterminer')
  expect(exercice.listeCorrections[0]).toContain('donc')
})

it('intègre le menu déroulant dans une phrase', () => {
  const exercice = new PositionPoint()
  exercice.interactif = true
  exercice.versionAleatoire = exercice.versionOriginale
  exercice.nouvelleVersion()
  const question = exercice.listeQuestions[0]
  expect(question).toContain('Le point $A$ <liste-deroulante')
  expect(question).toContain('la courbe $(C)$.')
  expect(question).not.toContain('Répondre par')
  expect(question).not.toContain('<mathalea-mathfield')
  expect(exercice.autoCorrection[0].formatInteractif).toBe('liste-deroulante')
  expect(exercice.autoCorrection[0].valeur?.reponse?.value).toBe('au-dessus')
})
