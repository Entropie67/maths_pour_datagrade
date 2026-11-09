import { afterEach, expect, it, vi } from 'vitest'
import LimitesDeterminables from '../../../../src/exercices/TSpe/TSA2-41'
import * as arrayOutils from '../../../../src/lib/outils/arrayOutils'
import * as outils from '../../../../src/modules/outils'

afterEach(() => vi.restoreAllMocks())

it.each([
  ['minorantAffine', 2, '+'],
  ['minorantAffine', -2, '-'],
  ['majorantAffine', 2, '-'],
  ['majorantAffine', -2, '+'],
  ['constante', 0, null],
] as const)(
  'vérifie les conclusions pour %s de pente %s',
  (type, slope, direction) => {
    vi.spyOn(arrayOutils, 'combinaisonListes').mockReturnValueOnce([type])
    vi.spyOn(outils, 'randint')
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(slope === 0 ? 0 : slope)
      .mockReturnValueOnce(0)
    const exercice = new LimitesDeterminables()
    exercice.nbQuestions = 1
    exercice.interactif = true
    exercice.nouvelleVersion()
    const propositions = exercice.autoCorrection[0].propositions ?? []
    expect(propositions).toHaveLength(4)
    const correct = propositions.filter((proposition) => proposition.statut)
    expect(correct).toHaveLength(1)
    expect(propositions.at(-1)?.texte).toBe('Aucune de ces limites')
    expect(correct[0].texte).toContain(
      direction === null ? 'Aucune de ces limites' : `x\\to${direction}\\infty`,
    )
    expect(
      propositions.some(
        (proposition) => proposition.texte === 'Aucune de ces limites',
      ),
    ).toBe(true)
  },
)
