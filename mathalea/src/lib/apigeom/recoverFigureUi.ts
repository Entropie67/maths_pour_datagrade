import type Figure from 'apigeom/src/Figure'
import ui from 'apigeom/src/uiMachine'
import { createActor } from 'xstate'

const boundFigures = new WeakSet<Figure>()

/** Permettre de reprendre une construction après une erreur de la machine apiGeom. */
export function enableFigureUiRecovery(figure: Figure): void {
  if (boundFigures.has(figure)) return
  boundFigures.add(figure)

  const reportError = (error: unknown) => {
    console.error('apiGeom : erreur de la machine à états.', error)
  }
  figure.ui.subscribe({ error: reportError })

  // La capture précède le onclick du bouton : celui-ci envoie alors son action
  // à une machine active. L'infobulle tactile reste indépendante de la machine.
  figure.divButtons.addEventListener(
    'click',
    (event) => {
      if (!figure.isDynamic || figure.ui?.getSnapshot().status !== 'error')
        return
      if (
        !(event.target instanceof Node) ||
        ![...figure.buttons.values()].some((button) =>
          button.contains(event.target as Node),
        )
      )
        return

      figure.ui.stop()
      for (const element of figure.tmpElements) {
        if (element.figure) element.remove()
      }
      figure.tmpElements = []
      for (const element of figure.selectedElements) element.isSelected = false
      figure.selectedElements = []
      figure.hoverPoints.clear()
      figure.inDrag = undefined
      figure.dragAllActive = false
      figure.currentState = ''
      figure.modal?.remove()
      figure.modal = undefined

      // Conserver les éléments construits et les piles annuler/rétablir.
      // Le montage initial a déjà installé les raccourcis clavier.
      figure.ui = createActor(
        ui.provide({ actions: { setupKeyboardRename: () => {} } }),
        {
          input: {
            figure,
            temp: { elements: [], htmlElement: [], strings: [], values: [] },
          },
        },
      )
      figure.ui.subscribe({ error: reportError })
      figure.ui.start()
    },
    true,
  )
}
