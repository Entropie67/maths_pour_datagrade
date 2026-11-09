import Figure from 'apigeom'
import type Point from 'apigeom/src/elements/points/Point'
import { apigeomFigureToSvg } from '../../lib/apigeom/apigeom-figure'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import ExerciceCan from '../ExerciceCan'

export const uuid = '065cf'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const titre = "Utiliser la somme des angles d'un triangle isocèle"
export const dateDePublication = '06/06/2026'

/**
 * DNB Antilles juin 2026 - Question 8
 * Triangle isocèle (non tracé en vraie grandeur) : l'angle au sommet est donné,
 * les deux angles à la base valent x.
 * @author Rémi Angot
 */
export default class AutoQ8Antillesbrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: ' $x=$', texteApres: '°' }
  }

  private construireFigure(angleSommet: number): string {
    const figure = new Figure({
      xMin: -1,
      yMin: -1,
      width: 260,
      height: 230,
      pixelsPerUnit: 45,
    })
    figure.options.color = 'black'
    const A = figure.create('Point', {
      x: 2,
      y: 3.5,
      label: 'A',
      shape: '',
      labelDxInPixels: 0,
      labelDyInPixels: 15,
    }) as Point
    const B = figure.create('Point', {
      x: 0,
      y: 0,
      label: 'B',
      shape: '',
      labelDxInPixels: -15,
      labelDyInPixels: -15,
    }) as Point
    const C = figure.create('Point', {
      x: 4,
      y: 0,
      label: 'C',
      shape: '',
      labelDxInPixels: 15,
      labelDyInPixels: -15,
    }) as Point

    figure.create('Segment', { point1: A, point2: B })
    figure.create('Segment', { point1: A, point2: C })
    figure.create('Segment', { point1: B, point2: C })
    figure.create('MarkBetweenPoints', { point1: A, point2: B, text: '|' })
    figure.create('MarkBetweenPoints', { point1: A, point2: C, text: '|' })
    figure.create('TextByPosition', { x: 2, y: 2.6, text: `${angleSommet}°` })
    figure.create('TextByPosition', { x: 0.6, y: 0.35, text: '$x$' })
    figure.create('TextByPosition', { x: 3.4, y: 0.35, text: '$x$' })

    if (context.isTypst) return apigeomFigureToSvg(figure)
    if (!context.isHtml) return figure.tikz()
    return figure.getStaticHtml({ center: true })
  }

  enonce(angleSommet?: number) {
    if (angleSommet == null) {
      angleSommet = choice([20, 40, 80, 100, 120, 140])
    }
    const x = (180 - angleSommet) / 2
    const figure = this.construireFigure(angleSommet)

    this.reponse = x
    this.question = `Le triangle ci-dessous n'est pas en vraie grandeur. Quelle est la valeur de $x$ ?<br>
${figure}`
    if (this.interactif) this.question += '<br>'

    this.correction = `La somme des mesures des angles d'un triangle est égale à $180$ en degré donc $x+x+${angleSommet}=180$ d'où $2x+${angleSommet}=180$, ou en ajoutant $-${angleSommet}$ à chaque membre : $2x=${180 - angleSommet}$ donc $x=${miseEnEvidence(x)}$ (en degrés).`
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.enonce(120)
    } else {
      this.enonce()
    }
  }
}
