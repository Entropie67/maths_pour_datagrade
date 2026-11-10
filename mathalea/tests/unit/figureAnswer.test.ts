import Figure from 'apigeom'
import { afterEach, describe, expect, it } from 'vitest'
import { figureAnswerJson } from '../../src/lib/apigeom/figureAnswer'

const figures: Figure[] = []
function createFigure() {
  const figure = new Figure()
  figures.push(figure)
  return figure
}

afterEach(() => {
  for (const figure of figures.splice(0)) figure.destroy()
})

describe('Sauvegarde des réponses ApiGeom', () => {
  it('conserve les styles de la palette dans une nouvelle figure', () => {
    const figure = createFigure()
    const A = figure.create('Point', { x: 0, y: 0, label: 'A' })
    const B = figure.create('Point', { x: 2, y: 0, label: 'B' })
    Object.assign(figure.options, {
      color: 'orange',
      thickness: 4,
      isDashed: true,
      pointSize: 9,
      labelDxInPixels: 17,
      labelDyInPixels: 23,
      labelIsVisible: false,
      fillOpacity: 0.7,
    })
    const C = figure.create('Point', { x: 1, y: 2, label: 'C' })
    const line = figure.create('Line', { point1: A, point2: B })
    const polygon = figure.create('Polygon', { points: [A, B, C] })
    const saved = JSON.parse(figureAnswerJson(figure))
    // ApiGeom omet bien les styles égaux aux options de la palette.
    expect(saved[line.id].color).toBeUndefined()
    expect(saved.options).not.toHaveProperty('tools')
    expect(JSON.stringify(saved).length).toBeLessThan(figure.json.length)

    const restored = createFigure()
    const tools = restored.options.tools
    restored.loadJson(saved)
    expect(restored.options.tools).toEqual(tools)
    for (const original of [C, line, polygon]) {
      expect(restored.elements.get(original.id)?.toJSON()).toEqual(
        original.toJSON(),
      )
    }
    expect(restored.svg.outerHTML).toContain('orange')
  })
})
