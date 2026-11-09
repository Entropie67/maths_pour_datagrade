import Figure from 'apigeom'
import { afterEach, describe, expect, it } from 'vitest'

const figures: Figure[] = []

function createFigure(): Figure {
  const figure = new Figure()
  figures.push(figure)
  document.body.appendChild(figure.container)
  return figure
}

afterEach(() => {
  for (const figure of figures.splice(0)) figure.destroy()
})

describe('nommage des points apiGeom — ticket #9796', () => {
  it('permet de renommer un point après suppression de son label', () => {
    const figure = createFigure()
    const point = figure.create('Point', { x: 0, y: 0, label: 'A' })
    const oldLabel = point.elementTextLabel!
    oldLabel.remove()

    expect(point.label).toBe('')
    expect(figure.elements.get(point.id)).toBe(point)
    point.label = "C'"
    expect(point.elementTextLabel).not.toBe(oldLabel)
    expect(point.elementTextLabel!.text).toBe("$C'$")
    expect(point.elementTextLabel!.div.isConnected).toBe(true)
  })

  it('conserve la lettre avant la prime même avec plusieurs points sans nom', () => {
    const figure = createFigure()
    const first = figure.create('Point', { x: 0, y: 0 })
    const second = figure.create('Point', { x: 2, y: 1 })
    for (const key of ['C', "'"]) {
      figure.divFigure.dispatchEvent(new KeyboardEvent('keydown', { key }))
    }

    expect(first.label).toBe("C'")
    expect(first.elementTextLabel!.text).toBe("$C'$")
    expect(second.label).toBe('')
  })
})
