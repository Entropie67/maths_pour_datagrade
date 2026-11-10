import { afterEach, describe, expect, it, vi } from 'vitest'
import ExpressionExponentielleGraphique from '../../src/exercices/TT/TTE-13'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import { context } from '../../src/modules/context'
import * as outils from '../../src/modules/outils'

afterEach(() => {
  context.isHtml = true
  context.isTypst = false
  vi.restoreAllMocks()
})

describe('TTE-13', () => {
  it.each([
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [3, 2],
    [3, 3],
  ])('aligne la grille sur les graduations (type %s, base %s)', (type, n) => {
    vi.spyOn(outils, 'randint').mockReturnValue(n)
    const exercice = new ExpressionExponentielleGraphique()
    exercice.sup = String(type)
    exercice.nouvelleVersion()
    const document = new DOMParser().parseFromString(
      exercice.listeQuestions[0],
      'text/html',
    )
    const lines = [...document.querySelectorAll('svg line')]
    const grid = lines.filter(
      (line) => line.getAttribute('stroke-opacity') === '0.4',
    )
    const ticks = lines.filter(
      (line) => line.getAttribute('stroke-width') === '1.2',
    )
    const coordinate = (line: Element, name: string) =>
      Number(line.getAttribute(name))
    const verticalGrid = grid.filter(
      (line) => coordinate(line, 'x1') === coordinate(line, 'x2'),
    )
    const horizontalGrid = grid.filter(
      (line) => coordinate(line, 'y1') === coordinate(line, 'y2'),
    )
    expect(verticalGrid).toHaveLength(4)
    for (const tick of ticks) {
      if (
        coordinate(tick, 'y1') > 0 &&
        coordinate(tick, 'y2') < 0 &&
        coordinate(tick, 'x1') !== 0
      ) {
        expect(
          verticalGrid.some(
            (line) => coordinate(line, 'x1') === coordinate(tick, 'x1'),
          ),
        ).toBe(true)
      }
      if (
        coordinate(tick, 'x1') < 0 &&
        coordinate(tick, 'x2') > 0 &&
        coordinate(tick, 'y1') !== 0
      ) {
        expect(
          horizontalGrid.some(
            (line) => coordinate(line, 'y1') === coordinate(tick, 'y1'),
          ),
        ).toBe(true)
      }
    }
  })

  it.each([
    [1, 1],
    [2, -1],
    [3, 2],
    [4, -2],
  ])('retrouve la base depuis la lecture de type %s', (type, x) => {
    const exercice = new ExpressionExponentielleGraphique()
    exercice.numeroExercice = 0
    exercice.sup = String(type)
    exercice.interactif = true
    exercice.nouvelleVersion()

    const correction = exercice.listeCorrections[0]
    const y = Number(correction.match(/coordonnées.*?;\\,([0-9]+)/)?.[1])
    expect(y).toBeGreaterThan(1)
    const n = Math.round(y ** (1 / Math.abs(x)))
    const answer = exercice.autoCorrection[0].valeur!.reponse!
    const options = answer.options!
    const expression = String(answer.value)
    const equivalent = x > 0 ? `${n}^{x}` : `${n}^{-x}`
    expect(fonctionComparaison(expression, expression, options).isOk).toBe(true)
    expect(fonctionComparaison(equivalent, expression, options).isOk).toBe(true)
    expect(fonctionComparaison(`${n + 1}^x`, expression, options).isOk).toBe(
      false,
    )
    expect(fonctionComparaison('', expression, options).isOk).toBe(false)
    expect(correction).toContain(`f(${x})=${y}`)
    expect(exercice.listeQuestions[0]).toContain('<svg')
    expect(exercice.listeQuestions[0]).toContain('<mathalea-mathfield')
    expect(exercice.listeCanEnonces[0]).not.toContain('mathfield')
    expect(exercice.listeCanReponsesACompleter[0]).toBe('$f(x)=\\ldots$')
  })

  it.each(['latex', 'typst'])(
    'génère le graphique et la correction pour %s sans champ interactif',
    (format) => {
      context.isHtml = format !== 'latex'
      context.isTypst = format === 'typst'
      const exercice = new ExpressionExponentielleGraphique()
      exercice.sup = '1-2-3-4'
      exercice.nbQuestions = 4
      exercice.nouvelleVersion()

      expect(exercice.listeQuestions).toHaveLength(4)
      for (const question of exercice.listeQuestions) {
        expect(question).not.toContain('mathfield')
        expect(question).toContain(
          format === 'latex' ? '\\begin{tikzpicture}' : '<svg',
        )
      }
      expect(exercice.listeCorrections.join('')).not.toMatch(/NaN|Infinity/)
    },
  )
})
