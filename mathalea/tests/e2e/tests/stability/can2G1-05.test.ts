import { afterEach, describe, expect, it } from 'vitest'
import '../../helpers/setupExerciseGeneration'
import CalculCoordonneesMilieu from '../../../../src/exercices/can/2e/can2G1-05'
import { pointsMaxExercice } from '../../../../src/lib/interactif/baremeExercice'
import { mathaleaHandleExerciceSimple } from '../../../../src/lib/mathalea'
import { context } from '../../../../src/modules/context'

const initialIsHtml = context.isHtml
afterEach(() => {
  context.isHtml = initialIsHtml
})

// Réponses de la version publiée pour la graine du signalement.
const publishedAnswers = {
  1: [['0', '\\dfrac{-8}{2}']],
  4: [
    ['\\dfrac{-3}{2}', '\\dfrac{-7}{2}'],
    ['\\dfrac{-6}{2}', '\\dfrac{-12}{2}'],
    ['\\dfrac{-4}{2}', '\\dfrac{-9}{2}'],
    ['\\dfrac{6}{2}', '\\dfrac{-6}{2}'],
  ],
}

describe('Énoncés des milieux de segments', () => {
  it.each([1, 4] as const)(
    'associe chaque énoncé à sa réponse pour %i questions',
    (nbQuestions) => {
      for (const interactif of [false, true]) {
        for (const isHtml of interactif ? [true] : [false, true]) {
          context.isHtml = isHtml
          const exercice = new CalculCoordonneesMilieu()
          exercice.nbQuestions = nbQuestions
          exercice.seed = 'xfr3'
          mathaleaHandleExerciceSimple(exercice, interactif, 0)

          expect(exercice.consigne).toBe('')
          expect(exercice.listeQuestions).toHaveLength(nbQuestions)
          expect(pointsMaxExercice(exercice)).toBe(nbQuestions)
          expect(
            exercice.autoCorrection.map(({ valeur }) => [
              valeur?.champ1.value,
              valeur?.champ2.value,
            ]),
          ).toEqual(publishedAnswers[nbQuestions])
          exercice.listeQuestions.forEach((question, i) => {
            expect(exercice.listeCanEnonces[i]).toContain(
              'Dans un repère du plan',
            )
            expect(question).toContain(exercice.listeCanEnonces[i])
            if (interactif && isHtml) {
              expect(question).toContain(`champTexteEx0Q${i}`)
              expect(question).toContain('placeholder[champ1]')
              expect(question).toContain('placeholder[champ2]')
            } else {
              expect(question).not.toContain('<fill-in-the-blank')
              expect(question).toContain('\\ldots')
            }
          })
        }
      }
    },
  )
})
