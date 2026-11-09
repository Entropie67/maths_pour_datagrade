import seedrandom from 'seedrandom'
import { describe, expect, it } from 'vitest'
import Exercice3L153 from '../../src/exercices/3e/3L15-3'
import { setOutputHtml } from '../../src/modules/context'

describe('3L15-3', () => {
  it('donne à chaque champ de réponse l’identifiant de sa question', () => {
    setOutputHtml()
    seedrandom('6zuo', { global: true })
    const exercice = new Exercice3L153()
    exercice.interactif = true
    exercice.numeroExercice = 0
    exercice.sup = 4
    exercice.nbQuestions = 10
    exercice.nouvelleVersion()

    const champs = exercice.listeQuestions.flatMap((question, i) => {
      const identifiants = [
        ...question.matchAll(/(?:\bid|\bfor)="(champTexteEx[^"]+)"/g),
      ].map((resultat) => resultat[1])
      return identifiants.map((identifiant) => ({ identifiant, i }))
    })

    expect(champs.length).toBeGreaterThan(0)
    for (const { identifiant, i } of champs) {
      expect(identifiant).toBe(`champTexteEx0Q${i}`)
    }
  })
})
