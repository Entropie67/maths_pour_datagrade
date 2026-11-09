import { beforeEach, describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import { GuideAne } from '../../src/lib/customElements/GuideAne'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import { setOutputHtml } from '../../src/modules/context'

describe('GuideAne', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  it('rehydrate son etat depuis sa value JSON', () => {
    const source = new GuideAne()
    source.update({
      n: 5,
      p: 2,
      alpha: 35,
      lengthAB: 7,
      target: 2.8,
      targetFraction: '2/5',
      targetColor: '#f15929',
      printAD: true,
      printRatio: true,
      fractionToDecimalAD: false,
      displayTargetOn: true,
    })

    const savedValue = source.value
    const target = new GuideAne()
    target.value = savedValue

    expect(typeof savedValue).toBe('string')
    expect(target.getState()).toMatchObject({
      n: 5,
      p: 2,
      alpha: 35,
      lengthAB: 7,
      target: 2.8,
      targetFraction: '2/5',
      targetColor: '#f15929',
      printAD: true,
      printRatio: true,
      fractionToDecimalAD: false,
      displayTargetOn: true,
    })
  })

  it('stocke sa value restaurable dans exercice.answers', () => {
    const exercice = new Exercice()
    exercice.numeroExercice = 4
    handleAnswers(
      exercice,
      0,
      {
        reponse: {
          value: JSON.stringify({
            n: 5,
            p: 2,
            lengthAD: 2.8,
            lengthAB: 7,
          }),
        },
      },
      { formatInteractif: 'guide-ane' },
    )

    const guideAne = new GuideAne()
    guideAne.id = 'guide-aneEx4Q0'
    guideAne.update({
      n: 5,
      p: 2,
      alpha: 35,
      lengthAB: 7,
      target: 2.8,
      targetFraction: '2/5',
      targetColor: '#f15929',
      printAD: true,
      printRatio: true,
      fractionToDecimalAD: false,
      displayTargetOn: true,
    })
    vi.spyOn(guideAne, 'isTargetReached').mockReturnValue(true)

    const resultSpan = document.createElement('span')
    resultSpan.id = 'resultatCheckEx4Q0'
    guideAne.appendChild(resultSpan)
    const feedback = document.createElement('div')
    feedback.id = 'feedbackEx4Q0'
    guideAne.appendChild(feedback)
    document.body.appendChild(guideAne)

    const result = GuideAne.verifQuestion(exercice, 0)

    expect(result.isOk).toBe(true)
    expect(exercice.answers).toEqual({ 'guide-aneEx4Q0': guideAne.value })
    const restored = new GuideAne()
    restored.value = exercice.answers?.['guide-aneEx4Q0'] ?? ''
    expect(restored.getState()).toMatchObject({ n: 5, p: 2, alpha: 35 })
  })
})
