import { describe, expect, it } from 'vitest'
import EquationsRacineCarree from '../../src/exercices/3e/3L15-2'

describe('3L15-2 : notation selon la référence', () => {
  it.each([
    ['3L15-2', false],
    ['11FA5B-7', false],
    ['1mCL4-1', true],
  ])('%s', (reference, lycee) => {
    const exercice = new EquationsRacineCarree()
    exercice.id = reference
    exercice.numeroExercice = 0
    exercice.nbQuestions = 1
    exercice.interactif = true
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions[0]).toContain(
      lycee ? '$S=$' : 'Les solutions sont :',
    )
    expect(exercice.autoCorrection[0]?.valeur?.reponse?.options).toMatchObject(
      lycee ? { ensembleDeNombres: true } : { suiteDeNombres: true },
    )
    expect(exercice.besoinFormulaire2CaseACocher).toBeFalsy()
  })
})
