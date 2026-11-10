import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ReadAffineSign from '../../src/exercices/1e/1A-F05-5'
import ReadParabolaSign from '../../src/exercices/1e/1A-F05-6'
import * as curves from '../../src/lib/2d/Courbe'
import * as tables from '../../src/lib/customElements/TableauSignesVariationsElement'
import { pointsMaxExercice } from '../../src/lib/interactif/baremeExercice'
import {
  context,
  setOutputHtml,
  setOutputLatex,
} from '../../src/modules/context'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  context.isTypst = false
  setOutputHtml()
})

describe.each([
  ['droite', ReadAffineSign, 1],
  ['parabole', ReadParabolaSign, 2],
] as const)('Lecture du signe sur une %s', (_, Exercise, rootCount) => {
  it('fait compléter les zéros et les signes pour un point par tirage', () => {
    const tableSpy = vi.spyOn(tables, 'addTableauSignesVariations')
    const curveSpy = vi.spyOn(curves, 'courbe')
    const randomSpy = vi.spyOn(Math, 'random')
    for (let seed = 0; seed < 40; seed++) {
      randomSpy.mockImplementation(seedrandom(`signe-${seed}`))
      tableSpy.mockClear()
      curveSpy.mockClear()
      const exercise = new Exercise()
      exercise.interactif = true
      exercise.nouvelleVersion()
      expect(exercise.autoCorrection[0].formatInteractif).toBe(
        'tableau-signes-variations',
      )
      expect(pointsMaxExercice(exercise)).toBe(1)
      expect(exercise.listeQuestions[0]).toContain('<tableau-signes-variations')
      expect(exercise.listeQuestions[0]).not.toContain('qcm')

      // Comparer le tableau correct à la fonction réellement tracée.
      const config = tableSpy.mock.calls[0][2].config
      const f = curveSpy.mock.calls[0][0]
      const boundaries = config.colonnes.map((column) =>
        Number(column.expected ?? column.valeur),
      )
      expect(boundaries).toHaveLength(rootCount + 2)
      for (const root of boundaries.slice(1, -1))
        expect(Math.abs(f(root))).toBe(0)
      const line = config.lignes[0]
      expect(line.type).toBe('signe')
      if (line.type !== 'signe')
        throw new Error('Une ligne de signes est attendue.')
      for (let index = 0; index < boundaries.length - 1; index++) {
        const midpoint = (boundaries[index] + boundaries[index + 1]) / 2
        expect(line.cellules[2 * index + 1].expected).toBe(
          f(midpoint) > 0 ? '+' : '-',
        )
        expect(Math.abs(f(boundaries[index]))).toBeLessThanOrEqual(4)
      }
      const expected = JSON.parse(
        String(exercise.autoCorrection[0].valeur?.reponse?.value),
      )
      expect(Object.keys(expected)).toHaveLength(2 * rootCount + 1)
      const bareme = exercise.autoCorrection[0].valeur!.bareme!
      expect(bareme(Object.keys(expected).map(() => 1))).toEqual([1, 1])
      expect(bareme(Object.keys(expected).map(() => 0))).toEqual([0, 1])
    }
  })

  it.each(['vide', 'incorrecte', 'correcte'])(
    'vérifie une saisie %s',
    (answer) => {
      const exercise = new Exercise()
      exercise.numeroExercice = 0
      exercise.interactif = true
      exercise.nouvelleVersion()
      document.body.innerHTML = exercise.listeQuestions[0]
      const element = document.querySelector(
        'tableau-signes-variations',
      ) as tables.TableauSignesVariationsElement
      element.connectedCallback()
      const expected = JSON.parse(
        String(exercise.autoCorrection[0].valeur?.reponse?.value),
      ) as Record<string, string>
      if (answer !== 'vide') {
        element.update(
          answer === 'correcte'
            ? expected
            : { ...expected, L1C1: expected.L1C1 === '+' ? '-' : '+' },
        )
      }
      const result = tables.TableauSignesVariationsElement.verifQuestion(
        exercise,
        0,
      )
      expect(result.isOk).toBe(answer === 'correcte')
      expect(result.score).toEqual({
        nbBonnesReponses: answer === 'correcte' ? 1 : 0,
        nbReponses: 1,
      })
    },
  )

  it('produit le tableau à compléter en LaTeX et en Typst', () => {
    setOutputLatex()
    const latexExercise = new Exercise()
    latexExercise.nouvelleVersion()
    expect(latexExercise.listeQuestions[0]).toContain('\\begin{tikzpicture}')
    expect(latexExercise.listeQuestions[0]).toContain('\\tkzTabInit')
    expect(latexExercise.listeQuestions[0]).not.toContain('mathalea-qcm')

    setOutputHtml()
    context.isTypst = true
    const typstExercise = new Exercise()
    typstExercise.nouvelleVersion()
    expect(typstExercise.listeQuestions[0]).toContain('<svg')
    expect(typstExercise.listeQuestions[0]).not.toContain('<mathalea-qcm')
    expect(typstExercise.listeQuestions[0]).toContain('<mathalea-typst>')
    expect(typstExercise.listeCorrections[0]).toContain('<mathalea-typst>')
  })
})
