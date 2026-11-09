import seedrandom from 'seedrandom'
import { describe, expect, it, vi } from 'vitest'
import IntersectionEtConditionnellesDiagramme from '../../src/exercices/1e/1A-P06-3'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

function questions(graine: string) {
  seedrandom(graine, { global: true })
  const exercice = new IntersectionEtConditionnellesDiagramme()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 12
  exercice.nouvelleVersion()
  return exercice.autoCorrection.map((autoCorrection, i) => {
    const { value, options } = (
      autoCorrection as unknown as {
        valeur: {
          reponse: { value: string; options: Record<string, boolean> }
        }
      }
    ).valeur.reponse
    return { value, options, enonce: exercice.listeQuestions[i] }
  })
}

/** Extrait numérateur et dénominateur de `\dfrac{n}{d}`. */
function termes(value: string): [number, number] {
  const m = /\\dfrac\{(\d+)\}\{(\d+)\}/.exec(value)
  if (m == null) throw new Error(`Fraction attendue : ${value}`)
  return [Number(m[1]), Number(m[2])]
}

describe('1A-P06-3 : fraction irréductible attendue', () => {
  it('n’affiche que « P(…)= » devant le champ en interactif', () => {
    for (const { enonce } of questions('p06-3-a')) {
      expect(enonce).toContain(
        'Donner la réponse sous forme de fraction irréductible.',
      )
      expect(enonce).not.toContain('Calculer')
    }
  })

  it('accepte la fraction irréductible, refuse une fraction égale non réduite', () => {
    for (const graine of ['p06-3-a', 'p06-3-b', 'p06-3-c']) {
      for (const { value, options } of questions(graine)) {
        const [n, d] = termes(value)
        expect(
          fonctionComparaison(`\\frac{${n}}{${d}}`, value, options).isOk,
        ).toBe(true)
        expect(
          fonctionComparaison(`\\frac{${2 * n}}{${2 * d}}`, value, options)
            .isOk,
        ).toBe(false)
        expect(
          fonctionComparaison(`\\frac{${3 * n}}{${3 * d}}`, value, options)
            .isOk,
        ).toBe(false)
        expect(fonctionComparaison(String(n / d), value, options).isOk).toBe(
          false,
        )
      }
    }
  })
})
