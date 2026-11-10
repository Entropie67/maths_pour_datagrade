import { describe, expect, it, vi } from 'vitest'
import SimplificationsRacinesCarrees from '../../src/exercices/can/2e/can2N5-08'

function generateExercise(radicand: number) {
  const exercise = new SimplificationsRacinesCarrees()
  vi.spyOn(exercise, 'quotaChoice').mockReturnValue(radicand)
  exercise.nouvelleVersion()
  const compare = exercise.compare
  if (!compare) throw new Error('Comparateur manquant')
  return (input: string) =>
    compare(input, String(exercise.reponse), exercise.optionsDeComparaison)
}

describe('can2N5-08 : simplification des racines carrées', () => {
  it.each([
    '2\\sqrt{10}',
    '2\\times\\sqrt{10}',
    '\\sqrt{10}\\times2',
    '2\\cdot\\sqrt{10}',
  ])('accepte %s pour la racine de 40', (input) => {
    expect(generateExercise(40)(input)).toMatchObject({ isOk: true, score: 1 })
  })

  it.each(['\\sqrt{40}', '2\\sqrt{5}', '4\\sqrt{10}', '-2\\sqrt{10}'])(
    'refuse %s pour la racine de 40',
    (input) => {
      expect(generateExercise(40)(input)).toMatchObject({
        isOk: false,
        score: 0,
      })
    },
  )

  it('accepte la réponse simplifiée pour chaque valeur proposée', () => {
    const exercise = new SimplificationsRacinesCarrees()
    const draw = vi.spyOn(exercise, 'quotaChoice')
    exercise.nouvelleVersion()
    const radicands = draw.mock.calls[0][1] as number[]
    for (const radicand of radicands) {
      draw.mockReturnValue(radicand)
      exercise.nouvelleVersion()
      expect(
        generateExercise(radicand)(String(exercise.reponse)),
      ).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(generateExercise(radicand)(`\\sqrt{${radicand}}`)).toMatchObject({
        isOk: false,
        score: 0,
      })
    }
  })
})
