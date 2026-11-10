import Figure from 'apigeom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableFigureUiRecovery } from '../../src/lib/apigeom/recoverFigureUi'

const figures: Figure[] = []
afterEach(() => {
  for (const figure of figures.splice(0)) figure.destroy()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

function createFigure() {
  const figure = new Figure()
  figures.push(figure)
  figure.setContainer(document.body.appendChild(document.createElement('div')))
  figure.setToolbar({ tools: ['POINT', 'SEGMENT', 'DRAG', 'UNDO', 'REDO'] })
  enableFigureUiRecovery(figure)
  return figure
}

describe('Reprise après un blocage apiGeom (#9795)', () => {
  it('reprend au choix suivant d’un outil sans perdre la construction ni l’historique', () => {
    const figure = createFigure()
    const point = figure.create('Point', { x: 0, y: 0, label: 'A' })
    figure.saveState()
    const history = [...figure.stackUndo]
    const report = vi.spyOn(console, 'error').mockImplementation(() => {})
    const originalTempCreate = figure.tempCreate.bind(figure)
    const tempCreate = vi.spyOn(figure, 'tempCreate')
    tempCreate.mockImplementationOnce((...args) => {
      originalTempCreate(...args)
      throw new Error('Échec pendant un geste.')
    })
    figure.buttons.get('SEGMENT')!.click()
    figure.ui.send({
      type: 'clickLocation',
      waitingWithModal: false,
      element: point,
      x: 0,
      y: 0,
    })
    expect(figure.ui.getSnapshot().status).toBe('error')
    expect(report).toHaveBeenCalledOnce()
    expect(figure.tmpElements).toHaveLength(1)

    const failedActor = figure.ui
    const addListener = vi.spyOn(figure.divFigure, 'addEventListener')
    figure.buttons.get('POINT')!.click()
    expect(figure.ui).not.toBe(failedActor)
    expect(figure.ui.getSnapshot().status).toBe('active')
    expect(figure.currentState).toBe('POINT')
    expect(figure.buttons.get('POINT')!.dataset.apigeomSelected).toBe('true')
    expect(figure.buttons.get('SEGMENT')!.dataset.apigeomSelected).toBe('false')
    expect(figure.elements.get(point.id)).toBe(point)
    expect(figure.stackUndo).toEqual(history)
    expect(figure.tmpElements).toHaveLength(0)
    expect(addListener).not.toHaveBeenCalled()

    figure.ui.send({
      type: 'clickLocation',
      waitingWithModal: false,
      x: 2,
      y: 2,
    })
    expect(
      [...figure.elements.values()].filter(
        (element) => element.type === 'Point',
      ),
    ).toHaveLength(2)
    figure.buttons.get('UNDO')!.click()
    expect(
      [...figure.elements.values()].filter(
        (element) => element.type === 'Point',
      ),
    ).toHaveLength(1)
    figure.buttons.get('REDO')!.click()
    expect(
      [...figure.elements.values()].filter(
        (element) => element.type === 'Point',
      ),
    ).toHaveLength(2)
    const points = [...figure.elements.values()].filter(
      (element) => element.type === 'Point',
    )
    figure.buttons.get('SEGMENT')!.click()
    for (const element of points) {
      figure.ui.send({
        type: 'clickLocation',
        waitingWithModal: false,
        element,
        x: 0,
        y: 0,
      })
    }
    expect(
      [...figure.elements.values()].filter(
        (element) => element.type === 'Segment' && !element.isChild,
      ),
    ).toHaveLength(1)
  })

  it('conserve une machine active et n’installe la récupération qu’une fois', () => {
    const figure = createFigure()
    const actor = figure.ui
    enableFigureUiRecovery(figure)
    figure.buttons.get('SEGMENT')!.click()
    figure.ui.send({
      type: 'clickLocation',
      waitingWithModal: false,
      x: 0,
      y: 0,
    })
    // Un double appui sur un outil ne doit pas remplacer une machine active.
    figure.buttons.get('POINT')!.click()
    figure.buttons.get('POINT')!.click()
    expect(figure.ui).toBe(actor)
    expect(figure.ui.getSnapshot().status).toBe('active')
  })
})
