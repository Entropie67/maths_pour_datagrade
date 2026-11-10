import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import AntecedentParCalcul from '../../exercices/3e/3F23-1'
import TraduireUnProgrammeDeCalcul from '../../exercices/5e/5N5A-2'
import { context } from '../../modules/context'
import type { IExercice } from '../types'
import { mathaleaEnsureAMCCompatibility } from './amcInference'
import { creerDocumentAmc } from './creerDocumentAmc'

type ExerciseConstructor = new () => IExercice

function prepareLikeAmcPage(
  ExerciseClass: ExerciseConstructor,
  configure?: (exercise: IExercice) => void,
) {
  const exercise = new ExerciseClass()
  exercise.seed = 'amc-qcm-coverage'
  exercise.id = exercise.uuid ?? ExerciseClass.name
  configure?.(exercise)

  exercise.interactif = true
  context.isHtml = true
  context.isAmc = false
  seedrandom(exercise.seed, { global: true })
  exercise.nouvelleVersionWrapper()
  const interactiveAutoCorrection = exercise.autoCorrection.map((item) => ({
    ...item,
    propositions: item.propositions?.map((proposition) => ({ ...proposition })),
  }))

  exercise.interactif = false
  context.isHtml = false
  context.isAmc = false
  ;(exercise as any).lastCallback = ''
  seedrandom(exercise.seed, { global: true })
  exercise.nouvelleVersionWrapper()
  const printableAutoCorrection = exercise.autoCorrection.map((item) => ({
    ...item,
    propositions: item.propositions?.map((proposition) => ({ ...proposition })),
  }))

  exercise.interactif = false
  context.isHtml = false
  context.isAmc = true
  ;(exercise as any).lastCallback = ''
  seedrandom(exercise.seed, { global: true })
  exercise.nouvelleVersionWrapper()
  ;(exercise as any).interactiveAutoCorrectionForAMC = interactiveAutoCorrection

  mathaleaEnsureAMCCompatibility(exercise)
  return { exercise, interactiveAutoCorrection, printableAutoCorrection }
}

afterEach(() => {
  context.isHtml = true
  context.isAmc = false
})

describe('couverture QCM de la page AMC', () => {
  it.each([
    {
      label: 'QCM historique propositionsQcm',
      ExerciseClass: TraduireUnProgrammeDeCalcul,
      configure: undefined,
    },
    {
      label: 'QCM moderne mathalea-qcm',
      ExerciseClass: AntecedentParCalcul,
      configure: (exercise: IExercice) => {
        exercise.sup2 = true
      },
    },
  ])(
    '$label conserve chaque question et chaque proposition',
    ({ ExerciseClass, configure }) => {
      const { exercise, interactiveAutoCorrection, printableAutoCorrection } =
        prepareLikeAmcPage(ExerciseClass, configure)

      expect(['qcmMono', 'qcmMult']).toContain(exercise.amcType)
      expect(exercise.autoCorrectionAMC).toHaveLength(
        interactiveAutoCorrection.length,
      )

      for (let index = 0; index < interactiveAutoCorrection.length; index++) {
        const source = interactiveAutoCorrection[index]
        const printable = printableAutoCorrection[index]
        const exported = exercise.autoCorrectionAMC?.[index]
        expect(exported?.propositions, `question ${index + 1}`).toHaveLength(
          source.propositions?.length ?? 0,
        )
        const propositionStatuses = (
          propositions: Array<{ texte?: string; statut?: unknown }> | undefined,
        ) =>
          (propositions ?? [])
            .map((proposition) => ({
              texte: proposition.texte ?? '',
              statut: Boolean(proposition.statut),
            }))
            .sort((left, right) => left.texte.localeCompare(right.texte))

        expect(propositionStatuses(printable?.propositions)).toEqual(
          propositionStatuses(source.propositions),
        )

        // Les passes HTML et AMC peuvent mélanger les propositions dans un
        // ordre différent. Le contrat à préserver est l'association entre le
        // texte et son statut, pas sa position dans le tableau.
        expect(propositionStatuses(exported?.propositions)).toEqual(
          propositionStatuses(source.propositions),
        )
      }

      vi.spyOn(document, 'getElementById').mockReturnValue({
        checked: false,
      } as unknown as HTMLElement)
      const latex = creerDocumentAmc({
        exercices: [exercise],
        assumeAmcPrepared: true,
      })
      const expectedCorrect = interactiveAutoCorrection.reduce(
        (total, item) =>
          total +
          (item.propositions ?? []).filter((proposition) =>
            Boolean(proposition.statut),
          ).length,
        0,
      )
      const expectedIncorrect = interactiveAutoCorrection.reduce(
        (total, item) =>
          total +
          (item.propositions ?? []).filter(
            (proposition) => !Boolean(proposition.statut),
          ).length,
        0,
      )

      expect(latex.match(/\\bonne\{/g) ?? []).toHaveLength(expectedCorrect)
      expect(latex.match(/\\mauvaise\{/g) ?? []).toHaveLength(expectedIncorrect)
    },
  )
})
