import { describe, expect, it } from 'vitest'
import type { IExercice } from '../types'
import { autoCorrectionIndicesOfQuestion } from './canScore'

const champ = (exercice: number, question: number) =>
  `<mathalea-mathfield mathfield-id="champTexteEx${exercice}Q${question}"></mathalea-mathfield>`

const exerciceDe = (
  listeQuestions: string[],
  nbChamps: number,
  numeroExercice = 0,
) =>
  ({
    numeroExercice,
    listeQuestions,
    autoCorrection: Array.from({ length: nbChamps }, () => ({})),
  }) as unknown as IExercice

describe('autoCorrectionIndicesOfQuestion', () => {
  it('associe un champ à chaque question dans le cas courant', () => {
    const exercice = exerciceDe([champ(0, 0), champ(0, 1)], 2)
    expect(autoCorrectionIndicesOfQuestion(exercice, 1)).toEqual([1])
  })

  it('retrouve tous les champs d’un énoncé unique (5G3A-9, 6G7B-6, 6G7B-7)', () => {
    const exercice = exerciceDe([champ(3, 0) + champ(3, 1) + champ(3, 2)], 3, 3)
    expect(autoCorrectionIndicesOfQuestion(exercice, 0)).toEqual([0, 1, 2])
  })

  it('attribue à chaque énoncé ses propres champs', () => {
    const exercice = exerciceDe(
      [champ(0, 0) + champ(0, 1), champ(0, 2) + champ(0, 3)],
      4,
    )
    expect(autoCorrectionIndicesOfQuestion(exercice, 1)).toEqual([2, 3])
  })

  it('ne confond pas les exercices ni les indices à plusieurs chiffres', () => {
    const exercice = exerciceDe([champ(1, 12) + champ(11, 3)], 13, 1)
    expect(autoCorrectionIndicesOfQuestion(exercice, 0)).toEqual([12])
  })

  it('compte un seul champ pour ses différents identifiants', () => {
    const exercice = exerciceDe(
      [`${champ(0, 0)}<div id="feedbackEx0Q0"></div>${champ(0, 1)}`],
      2,
    )
    expect(autoCorrectionIndicesOfQuestion(exercice, 0)).toEqual([0, 1])
  })

  it('ignore un identifiant sans réponse attendue', () => {
    const exercice = exerciceDe(
      [champ(0, 0), `${champ(0, 5)}`, 'Sans champ'],
      2,
    )
    expect(autoCorrectionIndicesOfQuestion(exercice, 0)).toEqual([0])
    expect(autoCorrectionIndicesOfQuestion(exercice, 1)).toEqual([1])
  })

  it('garde l’indice de la question quand aucun champ n’est trouvé (apiGeom)', () => {
    const exercice = exerciceDe(['<div id="apigeomEx0F0"></div>', 'Texte'], 1)
    expect(autoCorrectionIndicesOfQuestion(exercice, 1)).toEqual([1])
  })
})
