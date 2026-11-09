import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import handleInteractiveClock, {
  addInteractiveClock,
  InteractiveClock,
} from '../../src/lib/customElements/InteractiveClock'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import Hms from '../../src/modules/Hms'
import { setOutputHtml } from '../../src/modules/context'

describe('InteractiveClock', () => {
  let exercice: Exercice

  beforeAll(() => {
    handleInteractiveClock()
  })

  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
    exercice = new Exercice()
    exercice.numeroExercice = 3
    exercice.nbQuestions = 1
  })

  it("accepte l'heure de l'après-midi sur une horloge de 12 heures", () => {
    handleAnswers(
      exercice,
      0,
      { reponse: { value: new Hms({ hour: 13, minute: 30 }).toString() } },
      { formatInteractif: 'interactive-clock' },
    )
    document.body.innerHTML = addInteractiveClock(exercice, 0)
    const clock = document.querySelector(
      '#interactive-clockEx3Q0',
    ) as InteractiveClock
    clock.value = { hour: 1, minute: 30 }

    expect(InteractiveClock.verifQuestion(exercice, 0)).toMatchObject({
      isOk: true,
      score: { nbBonnesReponses: 1, nbReponses: 1 },
    })
  })
})
