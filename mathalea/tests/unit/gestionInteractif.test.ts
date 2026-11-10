import { beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import { setOutputAmc, setOutputHtml } from '../../src/modules/context'

describe('handleAnswers', () => {
  let exercice: Exercice

  beforeEach(() => {
    setOutputHtml()
    exercice = new Exercice()
    exercice.numeroExercice = 0
  })

  it('utilise mathalea-mathfield par defaut pour une reponse simple', () => {
    handleAnswers(exercice, 0, { reponse: { value: 42 } })

    expect(exercice.autoCorrection[0].formatInteractif).toBe(
      'mathalea-mathfield',
    )
  })

  it('alimente encore autoCorrectionAMC avec le format par defaut', () => {
    setOutputAmc()

    handleAnswers(exercice, 0, { reponse: { value: 42 } })

    expect(exercice.autoCorrection[0].formatInteractif).toBe(
      'mathalea-mathfield',
    )
    expect(exercice.autoCorrectionAMC[0].reponse?.valeur).toBe(42)
  })
})
