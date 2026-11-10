import { describe, expect, it } from 'vitest'
import AmeriqueNordNonSpe from '../../src/exercices/1e/1A-A01-2'

/** Texte d'une question sans les identifiants DOM, qui dépendent de son rang. */
const sansIdentifiants = (question: string) =>
  question.replace(/Ex\d+Q\d+/g, '').replace(/\s+/g, ' ')

function genere(graine: string, sup2: string, interactif = true) {
  const exercice = new AmeriqueNordNonSpe()
  exercice.seed = graine
  exercice.interactif = interactif
  exercice.numeroExercice = 0
  exercice.sup2 = sup2
  exercice.nouvelleVersionWrapper(0)
  return exercice.listeQuestions.map(sansIdentifiants)
}

describe('MetaExerciceCan : question choisie plusieurs fois', () => {
  it('donne des énoncés différents quand la question 4 est choisie trois fois (1A-A01-2)', () => {
    for (let k = 1; k <= 60; k++) {
      const questions = genere(`rep${k}`, '4-4-4')
      expect(questions).toHaveLength(3)
      expect(new Set(questions).size, `graine rep${k}`).toBe(3)
    }
  })

  it('en saisie libre comme en version papier', () => {
    for (let k = 1; k <= 20; k++) {
      for (const interactif of [true, false]) {
        const questions = genere(`papier${k}`, '4-4-4', interactif)
        expect(new Set(questions).size).toBe(3)
      }
    }
  })

  it('la première occurrence garde le tirage des liens déjà partagés', () => {
    for (let k = 1; k <= 20; k++) {
      const seule = genere(`stable${k}`, '4')
      const repetee = genere(`stable${k}`, '4-4-4')
      expect(repetee[0]).toBe(seule[0])
    }
  })

  it('des questions toutes différentes ne sont pas modifiées par le changement', () => {
    for (let k = 1; k <= 10; k++) {
      const ensemble = genere(`diff${k}`, '1-2-3')
      expect(genere(`diff${k}`, '1')[0]).toBe(ensemble[0])
      expect(genere(`diff${k}`, '2')[0]).toBe(ensemble[1])
      expect(genere(`diff${k}`, '3')[0]).toBe(ensemble[2])
    }
  })

  it('une répétition reste reproductible pour une même graine', () => {
    expect(genere('mêmegraine', '4-4-4')).toEqual(genere('mêmegraine', '4-4-4'))
  })
})
