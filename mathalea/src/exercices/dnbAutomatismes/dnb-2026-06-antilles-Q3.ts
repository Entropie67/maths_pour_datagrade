import Figure from 'apigeom'
import type Point from 'apigeom/src/elements/points/Point'
import { apigeomFigureToSvg } from '../../lib/apigeom/apigeom-figure'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'f5a23'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1GM2B-9', '9R2GM2B-9', '9R3GM2B-9'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Connaitre la formule de l'aire d'un triangle quelconque"
export const dateDePublication = '06/06/2026'

/**
 * DNB Antilles juin 2026 - Question 3
 * Aire du triangle
 * @author Rémi Angot
 */
export default class AutoQ3Antillesbrevet2026 extends ExerciceQcmA {
  private construireFigure(sujetOfficiel = false): string[] {
    const figure = new Figure({
      xMin: -1.5,
      yMin: -1.5,
      width: 300,
      height: 220,
      pixelsPerUnit: 36,
    })
    figure.options.color = 'black'

    const [labelA, labelB, labelC, labelH] = sujetOfficiel
      ? ['A', 'B', 'C', 'D']
      : [...creerNomDePolygone(3, ['H', 'D']), 'H']

    const A = figure.create('Point', {
      x: 0,
      y: 0,
      label: labelA,
      shape: '',
      labelDxInPixels: 0,
      labelDyInPixels: -20,
    }) as Point
    const H = figure.create('Point', {
      x: 2,
      y: 0,
      label: labelH,
      shape: '',
      labelDxInPixels: 0,
      labelDyInPixels: -20,
    }) as Point
    const C = figure.create('Point', {
      x: 6,
      y: 0,
      label: labelC,
      shape: '',
      labelDxInPixels: 0,
      labelDyInPixels: -20,
    }) as Point
    const B = figure.create('Point', {
      x: 2,
      y: 4,
      label: labelB,
      shape: '',
      labelDxInPixels: 0,
      labelDyInPixels: 20,
    }) as Point

    figure.create('Segment', { point1: H, point2: B })
    figure.create('Polygon', { points: [A, B, C] })
    figure.create('MarkRightAngle', { point: H, directionPoint: A })

    const displayedFigure = context.isTypst
      ? apigeomFigureToSvg(figure)
      : context.isHtml
        ? figure.getStaticHtml({ center: true })
        : figure.tikz()
    return [displayedFigure, labelA, labelB, labelC, labelH]
  }

  private appliquerLesValeurs(officiel = true): void {
    const [figure, labelA, labelB, labelC, labelH] =
      this.construireFigure(officiel)

    this.enonce = `On souhaite connaitre l'aire du triangle $${labelA + labelB + labelC}$`
    this.enonce += '<br>Quel calcul doit-on effectuer ?'
    this.enonce += '<br>'
    this.enonce += figure

    this.reponses = [
      `$${labelA + labelB} + ${labelB + labelC} + ${labelC + labelA}$`,
      `$${labelA + labelC} \\times ${labelB + labelH} \\div 2$`,
      `$${labelA + labelC} \\times ${labelB + labelH}$`,
      `$${labelA + labelB} \\times ${labelB + labelC} \\times ${labelC + labelA}$`,
    ]

    this.bonnesReponses = [false, true, false, false]
    this.correction = `L'aire d'un triangle est $\\dfrac{\\text{base} \\times \\text{hauteur}}{2}$`
    this.correction += `<br>Ici, en prenant $[${labelA + labelC}]$ comme base, la hauteur correspondante est $[${[labelB + labelC]}]$.`
    this.correction += `<br>Le calcul attendu est donc : $${labelA + labelC} \\times ${labelB + labelH} \\div 2$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(true)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    this.appliquerLesValeurs(false)
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options = { vertical: true, radio: true }
  }
}
