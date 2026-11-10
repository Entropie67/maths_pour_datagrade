import Figure from 'apigeom'
import type Point from 'apigeom/src/elements/points/Point'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import figureApigeom from '../../lib/figureApigeom'
import { numAlpha } from '../../lib/outils/outilString'
import { contraindreValeur } from '../../modules/outils'
import ConstruireParSymetrie, {
  type CentralSymmetryQuestion,
} from '../6e/_Construire_par_symetrie'
export const titre = "Construire le symétrique d'un point par symétrie centrale"
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '07/10/2026'
/**
 * @author Jean-claude Lhote
 */
export const uuid = '8d4bf'

export const refs = {
  'fr-fr': ['5G3A-1'],
  'fr-2016': ['5G11-1'],
  'fr-ch': ['9R1ES4D-2', '9R2ES4D-2', '9R3ES4D-2'],
}
export default class SymetrieCentralePoint extends ConstruireParSymetrie {
  goodAnswers: { label: string; x: number; y: number }[][] = []

  constructor() {
    super()
    this.figure = false
    this.version = 5
    this.besoinFormulaireNumerique = false
    this.besoinFormulaire3Texte = false
    this.besoinFormulaire5Numerique = ['Nombre de points à construire', 5]
    this.sup5 = 3
  }

  nouvelleVersion() {
    this.nbPointsSymetrieCentrale = contraindreValeur(1, 5, this.sup5, 3)
    this.figuresApiGeom = []
    this.goodAnswers = []
    super.nouvelleVersion()
  }

  protected centralSymmetryInteractive = ({
    i,
    points,
    center,
    bounds,
  }: CentralSymmetryQuestion): string => {
    const { xmin, ymin, xmax, ymax } = bounds
    const pixelsPerUnit = Math.min(30, 600 / (xmax - xmin))
    const figure = new Figure({
      xMin: xmin,
      yMin: ymin,
      width: (xmax - xmin) * pixelsPerUnit,
      height: (ymax - ymin) * pixelsPerUnit,
      pixelsPerUnit,
      snapGrid: this.sup2 < 3,
    })
    this.figuresApiGeom![i] = figure
    figure.options.pointDescriptionWithCoordinates = false
    figure.options.labelPointAfterCreation = true
    figure.setToolbar({
      tools: [
        'POINT',
        'POINT_ON',
        'POINT_INTERSECTION',
        'NAME_POINT',
        'LINE',
        'SEGMENT',
        'CIRCLE_CENTER_POINT',
        'DRAG',
        'HIDE',
        'REMOVE',
        'UNDO',
        'REDO',
      ],
      position: 'top',
    })
    if (this.sup2 < 3) {
      figure.create('Grid', {
        xMin: xmin,
        yMin: ymin,
        xMax: xmax,
        yMax: ymax,
        axeX: false,
        axeY: false,
        labelX: false,
        labelY: false,
        color: 'gray',
        isSelectable: false,
        isDeletable: false,
      })
      if (this.sup2 === 2) {
        figure.create('Grid', {
          xMin: xmin,
          yMin: ymin,
          xMax: xmax,
          yMax: ymax,
          stepY: 0.25,
          axeX: false,
          axeY: false,
          labelX: false,
          labelY: false,
          color: 'lightblue',
          isSelectable: false,
          isDeletable: false,
        })
      }
    }
    // Les points de l'énoncé ne doivent être ni supprimés, ni déplacés, ni
    // masqués, ni renommés (les outils DRAG et NAME_POINT ignorent `isFree` et
    // `isDeletable`, on neutralise donc `moveTo`, `hide` et le setter `label`).
    const fixeLePoint = (point: Point) => {
      point.isDeletable = false
      point.isFree = false
      point.moveTo = () => {}
      point.hide = () => {}
      const nom = point.label
      let proto = Object.getPrototypeOf(point)
      let descripteur = Object.getOwnPropertyDescriptor(proto, 'label')
      while (!descripteur && proto) {
        proto = Object.getPrototypeOf(proto)
        descripteur = proto && Object.getOwnPropertyDescriptor(proto, 'label')
      }
      if (descripteur?.get && descripteur.set) {
        const { get, set } = descripteur
        Object.defineProperty(point, 'label', {
          configurable: true,
          get() {
            return get.call(point)
          },
          set(valeur: string | undefined) {
            if (valeur === nom) set.call(point, valeur)
          },
        })
      }
    }
    const initialPointIds: string[] = []
    for (const point of [center, ...points]) {
      const initialPoint = figure.create('Point', {
        x: point.x,
        y: point.y,
        label: point.nom,
        isFree: false,
      })
      fixeLePoint(initialPoint)
      initialPointIds.push(initialPoint.id)
    }
    // Réappliquer les contraintes des points donnés après un undo/redo.
    figure.onChange(() => {
      for (const id of initialPointIds) {
        const point = figure.elements.get(id) as Point | undefined
        if (point) fixeLePoint(point)
      }
    })
    figure.options.color = 'blue'
    this.goodAnswers[i] = points.map((point) => ({
      label: `${point.nom}'`,
      x: 2 * center.x - point.x,
      y: 2 * center.y - point.y,
    }))
    const instructions = points
      .map(
        (point, index) =>
          `${points.length > 1 ? numAlpha(index) + ' ' : ''}Construire le point $${point.nom}'$, symétrique de $${point.nom}$ par rapport au point $${center.nom}$.`,
      )
      .join('<br>')
    return (
      instructions +
      '<br>' +
      figureApigeom({ exercice: this, i, figure, defaultAction: 'POINT' })
    )
  }

  correctionInteractive = (i: number) => {
    const figure = this.figuresApiGeom?.[i]
    const answers = this.goodAnswers[i]
    if (!figure || !answers) return ['KO', 'KO', 'KO']
    this.answers ??= {}
    this.answers[figure.id] = figureAnswerJson(figure)
    const feedback: string[] = []
    const results = answers.map((answer) => {
      const { isValid, points } = figure.checkCoords(answer)
      if (!isValid) {
        feedback.push(
          points.length === 0
            ? `Construire et nommer le point $${answer.label}$.`
            : points.length > 1
              ? `Nommer un seul point $${answer.label}$.`
              : `Revoir la position du point $${answer.label}$.`,
        )
      }
      for (const point of points) {
        point.color = isValid ? 'green' : 'red'
        point.colorLabel = isValid ? 'green' : 'red'
        point.thickness = 3
      }
      return isValid ? 'OK' : 'KO'
    })
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    if (divFeedback) divFeedback.innerHTML = feedback.join('<br>')
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    return results
  }
}
