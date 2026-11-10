import { describe, expect, it } from 'vitest'
import Exercice6N4A2 from '../../src/exercices/6e/6N4A-2'

/** Chaque question vaut toujours quatre points : un champ par nombre manquant. */
describe('6N4A-2', () => {
  const genere = (
    sup: string,
    sup2: string,
    seed: string,
    interactif: boolean,
  ) => {
    const exercice = new Exercice6N4A2()
    exercice.seed = seed
    exercice.sup = sup
    exercice.sup2 = sup2
    exercice.nbQuestions = 4
    exercice.numeroExercice = 0
    exercice.interactif = interactif
    exercice.nouvelleVersionWrapper()
    return exercice
  }
  const typesDeQuestions = ['1', '2', '3']
  const typesDeProblemes = ['1', '2', '3', '4']

  it('propose quatre champs par question, chacun avec une réponse', () => {
    for (const sup of typesDeQuestions) {
      for (const sup2 of typesDeProblemes) {
        for (const seed of ['a', 'b', 'c', 'd', 'e']) {
          const exercice = genere(sup, sup2, seed, true)
          const identifiants = exercice.listeQuestions
            .join('')
            .match(/id="champTexteEx0Q\d+"/g)
          expect(identifiants).toHaveLength(16)
          expect(new Set(identifiants).size).toBe(16)
          for (let i = 0; i < 16; i++) {
            expect(
              exercice.autoCorrection[i]?.valeur?.reponse?.value,
            ).toBeDefined()
          }
        }
      }
    }
  })

  it("n'affiche aucune zone non remplacée, sans interactivité", () => {
    for (const sup of typesDeQuestions) {
      for (const sup2 of typesDeProblemes) {
        const exercice = genere(sup, sup2, 'a', false)
        const texte = [
          ...exercice.listeQuestions,
          ...exercice.listeCorrections,
        ].join('')
        expect(exercice.listeQuestions).toHaveLength(4)
        expect(texte).not.toMatch(/zone\d/)
      }
    }
  })
})
