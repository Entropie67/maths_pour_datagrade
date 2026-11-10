import { expect, it } from 'vitest'
import AutoFMsansSpe2026 from '../../src/exercices/1e/1A-A01-7'

it('mélange indépendamment les QCM d’un sujet officiel', () => {
  const exercice = new AutoFMsansSpe2026()
  exercice.seed = 'sujet-officiel'
  exercice.interactif = true
  exercice.sup = true
  // Par défaut, la composition est en saisie libre : on demande les QCM.
  exercice.sup4 = true

  exercice.nouvelleVersion()

  const positionsDesBonnesReponses = exercice.autoCorrection.map(
    (question) => question.propositions?.findIndex(({ statut }) => statut),
  )
  expect(new Set(positionsDesBonnesReponses).size).toBeGreaterThan(1)

  const exerciceRejoue = new AutoFMsansSpe2026()
  exerciceRejoue.seed = 'sujet-officiel'
  exerciceRejoue.interactif = true
  exerciceRejoue.sup = true
  exerciceRejoue.sup4 = true
  exerciceRejoue.nouvelleVersion()
  expect(
    exerciceRejoue.autoCorrection.map((question) =>
      question.propositions?.findIndex(({ statut }) => statut),
    ),
  ).toEqual(positionsDesBonnesReponses)
})
