import { describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import {
  getShortAnswer,
  minimalCorrection,
} from '../../src/components/setup/typst/minimalCorrection'
import { extraitReponsesCourtes } from '../../src/components/setup/diaporama/answersTable'
import { miseEnEvidence } from '../../src/lib/outils/embellissements'

const correction = `Une étape $${miseEnEvidence('12')}$, puis une figure.`

describe('réponses courtes explicites', () => {
  it('donne priorité à la réponse explicite, même sans orange', () => {
    const answer = '$-6$'
    expect(minimalCorrection(correction, answer)).toBe(answer)
    expect(extraitReponsesCourtes(correction, true, answer)).toEqual([answer])
  })

  it('conserve toute la correction pour une question sans réponse courte', () => {
    expect(minimalCorrection(correction, null)).toBe(correction)
    expect(extraitReponsesCourtes(correction, true, null)).toEqual([])
  })

  it('extrait toujours les réponses orange en l’absence de déclaration', () => {
    for (const answer of [undefined, '', '   ']) {
      expect(minimalCorrection(correction, answer)).toBe(
        `$${miseEnEvidence('12')}$`,
      )
      expect(extraitReponsesCourtes(correction, true, answer)).toEqual([
        '$\\boldsymbol{12}$',
      ])
    }
  })

  it('permet de combiner figures et réponses courtes dans le même exercice', () => {
    const exercise = new Exercice()
    exercise.listeReponsesCourtes = [null, '$3$', '']
    expect(getShortAnswer(exercise, 0)).toBeNull()
    expect(getShortAnswer(exercise, 1)).toBe('$3$')
    expect(getShortAnswer(exercise, 2)).toBeUndefined()
    exercise.reponseCourteDisponible = false
    expect(getShortAnswer(exercise, 2)).toBeNull()
    expect(getShortAnswer(exercise, 1)).toBe('$3$')
  })

  it('efface les réponses du tirage précédent sans perdre la déclaration de l’exercice', () => {
    const exercise = new Exercice()
    exercise.reponseCourteDisponible = false
    exercise.listeReponsesCourtes = ['$7$', null]
    exercise.reponseCourteExplicite = '$7$'
    exercise.reinit()
    expect(exercise.listeReponsesCourtes).toEqual([])
    expect(exercise.reponseCourteExplicite).toBeUndefined()
    expect(exercise.reponseCourteDisponible).toBe(false)
  })
})
