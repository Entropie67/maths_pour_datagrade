import { describe, expect, it } from 'vitest'
import {
  addCurveTracerColumn,
  assessCurveTracer,
  curveTracerPrecisionScore,
  curveTracerLatexTickDistance,
  curveTracerCalculationLatex,
  formatCurveTracerInvalidPoints,
  curveTracerTicks,
  formatFrenchLatexNumber,
  parseCurveTracerNumber,
  removeCurveTracerColumn,
  restoreCurveTracerFocus,
  sampleFunction,
  sortCurveTracerPoints,
} from '../../src/lib/customElements/TraceurDeCourbe'

describe('curveTracerModel', () => {
  it('restaure le focus vers la cellule visée après une reconstruction', async () => {
    const table = document.createElement('div')
    table.innerHTML =
      '<input id="champTexteEx0Q0L0C1" data-row="0" data-index="0"><input id="champTexteEx0Q0L1C1" data-row="1" data-index="0">'
    document.body.append(table)

    restoreCurveTracerFocus(table, {
      id: 'champTexteEx0Q0L1C1',
      row: 1,
      index: 0,
    })
    await Promise.resolve()

    expect(document.activeElement?.id).toBe('champTexteEx0Q0L1C1')
    table.remove()
  })

  it('restaure le focus sous la valeur de x après son déplacement', async () => {
    const table = document.createElement('div')
    table.innerHTML =
      '<input id="champTexteEx0Q0L1C1" data-row="1" data-index="0"><input id="champTexteEx0Q0L1C2" data-row="1" data-index="1">'
    document.body.append(table)

    restoreCurveTracerFocus(table, {
      id: 'champTexteEx0Q0L1C2',
      row: 1,
      index: 0,
    })
    await Promise.resolve()

    expect(document.activeElement?.id).toBe('champTexteEx0Q0L1C1')
    table.remove()
  })

  it('calcule des graduations régulières et lisibles', () => {
    expect(curveTracerTicks(-0.5, 6.5)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(curveTracerTicks(-0.1, 1.1)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1])
  })

  it('adapte le pas des graduations LaTeX à une grande amplitude', () => {
    expect(curveTracerLatexTickDistance(-6, 86)).toBe(10)
    expect(curveTracerLatexTickDistance(-5, 5)).toBe(1)
  })

  it('réinjecte les décimaux dans MathLive avec une virgule', () => {
    expect(formatFrenchLatexNumber(3.5)).toBe('3,5')
    expect(formatFrenchLatexNumber(4)).toBe('4')
  })

  it('rédige un calcul avec des fractions LaTeX et les bons signes', () => {
    expect(
      curveTracerCalculationLatex('-\\dfrac{1}{3}x-\\dfrac{1}{3}', 'x', -3),
    ).toBe('-\\dfrac{1}{3}\\times \\left(-3\\right)-\\dfrac{1}{3}')
    expect(curveTracerCalculationLatex('\\pi r^2', 'r', 2)).toBe(
      '\\pi \\times 2^2',
    )
  })

  it('refuse un tableau vide sans assimiler les cases à zéro', () => {
    const result = assessCurveTracer(
      Array.from({ length: 5 }, () => ({ x: null, y: null })),
      (x) => x ** 2,
      {
        xMin: 0,
        xMax: 5,
        step: 0.1,
        epsilon: 0.01,
        maxRelativeAreaError: 0.2,
      },
    )
    expect(result.incomplete).toBe(true)
    expect(result.validPoints).toBe(false)
    expect(result.representative).toBe(false)
  })

  it('énumère tous les points qui ne sont pas sur la courbe', () => {
    const result = assessCurveTracer(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 5 },
        { x: 3, y: 9 },
        { x: 4, y: 15 },
        { x: 5, y: 24 },
      ],
      (x) => x * x,
      {
        xMin: 0,
        xMax: 5,
        step: 0.1,
        epsilon: 0.01,
        maxRelativeAreaError: 0.2,
      },
    )

    expect(result.invalidPointIndexes).toEqual([2, 4, 5])
    expect(formatCurveTracerInvalidPoints(result.invalidPointIndexes)).toBe(
      'Les points n°3, 5 et 6 ne sont pas sur la courbe.',
    )
  })

  it('convertit nombres décimaux et fractions MathLive', () => {
    expect(parseCurveTracerNumber('1,25')).toBe(1.25)
    expect(parseCurveTracerNumber('\\frac{3}{4}')).toBe(0.75)
    expect(parseCurveTracerNumber('-2/5')).toBe(-0.4)
    expect(parseCurveTracerNumber('x+1')).toBeNull()
  })

  it('trie les points renseignés puis conserve les cases vides', () => {
    expect(
      sortCurveTracerPoints([
        { x: 2, y: 4 },
        { x: null, y: null },
        { x: -1, y: 1 },
      ]),
    ).toEqual([
      { x: -1, y: 1 },
      { x: 2, y: 4 },
      { x: null, y: null },
    ])
  })

  it('ajoute une colonne sans modifier les couples existants', () => {
    const points = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]

    expect(addCurveTracerColumn(points)).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: null, y: null },
    ])
    expect(points).toHaveLength(2)
  })

  it('retire seulement les colonnes ajoutées', () => {
    const initialPoints = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]
    const withExtraColumn = addCurveTracerColumn(initialPoints)

    expect(removeCurveTracerColumn(withExtraColumn, 2)).toEqual(initialPoints)
    expect(removeCurveTracerColumn(initialPoints, 2)).toEqual(initialPoints)
  })

  it("déplace l'ordonnée avec son abscisse lors du tri", () => {
    expect(
      sortCurveTracerPoints([
        { x: 4, y: 16 },
        { x: 1, y: null },
        { x: 3, y: 9 },
      ]),
    ).toEqual([
      { x: 1, y: null },
      { x: 3, y: 9 },
      { x: 4, y: 16 },
    ])
  })

  it('inclut les deux bornes dans le balayage', () => {
    expect(
      sampleFunction((x) => x * x, -1, 1, 0.6).map((point) => point.x),
    ).toEqual([-1, -0.4, 0.19999999999999996, 0.7999999999999998, 1])
  })

  it('sépare validité des couples et qualité de représentation', () => {
    const good = assessCurveTracer(
      [
        { x: -1, y: 1 },
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      (x) => x * x,
      {
        xMin: -1,
        xMax: 1,
        step: 0.02,
        epsilon: 0.01,
        maxRelativeAreaError: 0.6,
      },
    )
    expect(good.validPoints).toBe(true)
    expect(good.representative).toBe(true)
    const wrong = assessCurveTracer(
      [
        { x: -1, y: 1 },
        { x: 0, y: 2 },
        { x: 1, y: 1 },
      ],
      (x) => x * x,
      {
        xMin: -1,
        xMax: 1,
        step: 0.02,
        epsilon: 0.01,
        maxRelativeAreaError: 0.6,
      },
    )
    expect(wrong.validPoints).toBe(false)
    expect(wrong.representative).toBe(false)
  })

  it("gradue le score de précision selon l'écart d'aire", () => {
    expect(curveTracerPrecisionScore(Infinity, 0.16)).toBe(0)
    expect(curveTracerPrecisionScore(0.17, 0.16)).toBe(0)
    expect(curveTracerPrecisionScore(0.16, 0.16)).toBe(1)
    expect(curveTracerPrecisionScore(0.08, 0.16)).toBe(2)
    expect(curveTracerPrecisionScore(0.04, 0.16)).toBe(3)
    expect(curveTracerPrecisionScore(0.02, 0.16)).toBe(4)
  })

  it('considère une fonction affine parfaitement tracée entre ses bornes', () => {
    const target = (x: number) => (-7 * x) / 2 + 6
    const assessment = assessCurveTracer(
      [
        { x: -5, y: 23.5 },
        { x: 5, y: -11.5 },
      ],
      target,
      {
        xMin: -5,
        xMax: 5,
        step: 0.05,
        epsilon: 0.05,
        maxRelativeAreaError: 0.08,
      },
    )

    expect(assessment.validPoints).toBe(true)
    expect(assessment.relativeAreaError).toBeLessThan(1e-12)
    expect(curveTracerPrecisionScore(assessment.relativeAreaError, 0.08)).toBe(
      4,
    )
  })
})
