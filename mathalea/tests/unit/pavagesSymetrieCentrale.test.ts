import seedrandom from 'seedrandom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/lib/renderScratch', () => ({
  renderScratch: vi.fn(() => ''),
}))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(() => ''),
}))

import PavagesEtDemiTour from '../../src/exercices/5e/5G3A-10'
import { pointsMaxExercice } from '../../src/lib/interactif/baremeExercice'
import { parseCasFormulaireTexte } from '../../src/lib/formulaireTexteListe'
import {
  context,
  setOutputAmc,
  setOutputHtml,
  setOutputLatex,
} from '../../src/modules/context'

class TestablePavages extends PavagesEtDemiTour {
  drawTiling() {
    return this.chooseTiling()
  }
}

function generate(tiling: number, centres: number) {
  const exo = new PavagesEtDemiTour()
  exo.numeroExercice = 0
  exo.interactif = true
  exo.sup2 = tiling
  exo.sup3 = centres
  exo.nouvelleVersion(0)
  return exo
}

beforeEach(() => {
  setOutputHtml()
  vi.spyOn(Math, 'random').mockImplementation(seedrandom('9779'))
})
afterEach(() => {
  vi.restoreAllMocks()
  setOutputHtml()
})

describe('paramétrage de 5G3A-10', () => {
  it('expose les huit pavages dans une liste pondérée', () => {
    const exo = new PavagesEtDemiTour()
    const form = exo.besoinFormulaire2Texte
    if (!Array.isArray(form)) throw new Error('Formulaire absent.')
    const parsed = parseCasFormulaireTexte(form[1])
    expect(parsed?.cas).toHaveLength(8)
    expect(parsed?.melange).toBe(9)
    expect(exo.sup3).toBe(3)
  })

  it('respecte chaque pavage sélectionné, y compris les losanges', () => {
    const exo = new TestablePavages()
    for (let i = 1; i <= 8; i++) {
      exo.sup2 = i
      expect(exo.drawTiling()).toBe(i - 1)
    }
  })

  it('tient compte des répétitions sans tirer un pavage exclu', () => {
    const exo = new TestablePavages()
    exo.sup2 = '1-1-1-8'
    const draws = Array.from({ length: 400 }, () => exo.drawTiling())
    expect(new Set(draws)).toEqual(new Set([0, 7]))
    const squares = draws.filter((value) => value === 0).length
    expect(squares).toBeGreaterThan(260)
    expect(squares).toBeLessThan(340)
  })

  it('permet de tirer tous les pavages avec le mélange', () => {
    const exo = new TestablePavages()
    exo.sup2 = 9
    expect(
      new Set(Array.from({ length: 100 }, () => exo.drawTiling())).size,
    ).toBe(8)
  })

  for (let tiling = 1; tiling <= 8; tiling++) {
    it.each([1, 2, 3])(
      `affiche et corrige %i centres pour le pavage ${tiling}, sur trois points`,
      (count) => {
        const exo = generate(tiling, count)
        const question = exo.listeQuestions[0]
        const correction = exo.listeCorrections[0]
        expect(question.match(/Donner le numéro/g)).toHaveLength(count)
        expect(correction.match(/porte le numéro/g)).toHaveLength(count)
        expect(correction.match(/Relancer l'animation/g)).toHaveLength(count)
        expect(correction.match(/<animateTransform/g)).toHaveLength(count)
        expect(exo.autoCorrection).toHaveLength(1)
        expect(pointsMaxExercice(exo)).toBe(3)
        const answers = exo.autoCorrection[0].valeur
        expect(
          Object.keys(answers ?? {}).filter((key) => key.startsWith('champ')),
        ).toHaveLength(count)
      },
    )
  }

  it.each([1, 2, 3])(
    'exporte %i réponses AMC sans champ interactif',
    (count) => {
      setOutputAmc()
      const exo = generate(8, count)
      expect(exo.autoCorrectionAMC[0].propositions).toHaveLength(count)
      expect(JSON.stringify(exo.autoCorrectionAMC)).not.toMatch(
        /%\{champ|multi-mathfield/,
      )
      expect(exo.questionsAMC[0]).toBeDefined()
    },
  )

  it('conserve deux consignes et leur correction en LaTeX', () => {
    setOutputLatex()
    const exo = generate(1, 2)
    expect(exo.listeQuestions[0].match(/Donner le numéro/g)).toHaveLength(2)
    expect(exo.listeQuestions[0]).toContain('\\begin{tikzpicture}')
    expect(exo.listeCorrections[0].match(/porte le numéro/g)).toHaveLength(2)
    expect(context.isHtml).toBe(false)
  })
})
