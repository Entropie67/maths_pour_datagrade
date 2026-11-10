import seedrandom from 'seedrandom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RegionsDuPlan from '../../src/exercices/6e/6G2C-1'
import * as cercles from '../../src/lib/2d/cercle'
import { context } from '../../src/modules/context'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const originalRandom = Math.random

beforeEach(() => {
  context.isHtml = true
  context.isAmc = false
  context.isTypst = false
})

afterEach(() => {
  Math.random = originalRandom
  vi.restoreAllMocks()
})

function genere(sup: string, seed: string, interactif = false) {
  seedrandom(seed, { global: true })
  const exercice = new RegionsDuPlan()
  exercice.numeroExercice = 0
  exercice.sup = sup
  exercice.interactif = interactif
  exercice.nouvelleVersion()
  return exercice
}

const seeds = ['uxb0', 'rIjj', ...Array.from({ length: 30 }, (_, i) => `${i}`)]

describe('6G2C-1 : régions du plan', () => {
  it.each(['5', '6', '7'])(
    'génère uniquement des cercles sécants (type %s)',
    (sup) => {
      const cercle = vi.spyOn(cercles, 'cercle')
      for (const seed of seeds) {
        cercle.mockClear()
        const exercice = genere(sup, seed)
        expect(exercice.listeQuestions).toHaveLength(1)
        expect(exercice.listeCorrections).toHaveLength(1)
        const [[centre1, rayon1], [centre2, rayon2]] = cercle.mock.calls
        const distance = Math.hypot(
          centre2.x - centre1.x,
          centre2.y - centre1.y,
        )
        expect(distance).toBeGreaterThan(Math.abs(rayon1 - rayon2))
        expect(distance).toBeLessThan(rayon1 + rayon2)
        expect(exercice.listeQuestions[0]).not.toMatch(/NaN|Infinity/)
      }
    },
  )

  it.each([
    ['1', 1, ['<']],
    ['2', 1, ['>']],
    ['3', 1, ['=']],
    ['4', 2, ['<', '<']],
    ['5', 2, ['<', '<']],
    ['6', 2, ['>', '>']],
    ['7', 2, ['<', '>']],
    ['8', 1, ['=']],
    ['9', 1, ['<']],
  ])(
    'annonce le nombre de conditions et attend les bons symboles (type %s)',
    (sup, nbConditions, symboles) => {
      for (const seed of seeds.slice(0, 5)) {
        const exercice = genere(sup, seed, true)
        const enonce = exercice.listeQuestions[0]
        expect(enonce).toContain(
          nbConditions === 1
            ? 'Trouver la condition vérifiée'
            : 'Trouver les deux conditions vérifiées',
        )
        const reponses = exercice.autoCorrection[0].valeur as Record<
          string,
          unknown
        >
        expect(reponses.bareme).toBeTypeOf('function')
        symboles.forEach((symbole, k) => {
          expect(reponses[`champ${k + 1}`]).toEqual({ value: symbole })
        })
        expect(reponses[`champ${symboles.length + 1}`]).toBeUndefined()
      }
    },
  )

  it("l'intersection de deux disques attend une condition par disque", () => {
    const exercice = genere('5', 'rIjj', true)
    // Deux conditions séparées et non un encadrement de MA.
    expect(exercice.listeQuestions[0]).toMatch(
      /M[A-Z] \\placeholder\[champ1\]\{\} [\d,]+\\text\{ cm\} \\text\{ et \} M[A-Z] \\placeholder\[champ2\]\{\}/,
    )
  })

  it('le mélange par défaut ne propose ni médiatrice ni demi-plan', () => {
    for (const seed of seeds) {
      seedrandom(seed, { global: true })
      const exercice = new RegionsDuPlan()
      exercice.nbQuestions = 7
      exercice.nouvelleVersion()
      for (const correction of exercice.listeCorrections) {
        expect(correction).not.toContain('médiatrice')
      }
    }
  })
})
