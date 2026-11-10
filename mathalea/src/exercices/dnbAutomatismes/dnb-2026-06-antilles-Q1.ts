import Figure from 'apigeom'
import type Point from 'apigeom/src/elements/points/Point'
import { apigeomFigureToSvg } from '../../lib/apigeom/apigeom-figure'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cf880'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1ES5A-7', '9R2ES5A-7', '9R3ES5A-7', 'PRQPF02A-7'],
}
export const interactifReady = true

export const titre = "Lire les coordonnées d'un point dans un repère"
export const dateDePublication = '06/06/2026'

/**
 * DNB Antilles juin 2026 - Question 1
 * @author Rémi Angot
 */
export default class AutoQ1Antillesbrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'multi-mathfield'
  }

  private construireFigure(xA: number, yA: number): string {
    const xMin = -4
    const xMax = 4
    const yMin = -4
    const yMax = 4
    const pixelsPerUnit = 28
    const figure = new Figure({
      xMin,
      yMin,
      width: (xMax - xMin) * pixelsPerUnit,
      height: (yMax - yMin) * pixelsPerUnit,
      pixelsPerUnit,
    })
    figure.options.color = 'black'
    figure.create('Grid', { xMin, yMin, xMax, yMax })
    figure.create('Point', {
      x: xA,
      y: yA,
      label: 'A',
      shape: 'x',
      color: 'black',
    }) as Point
    figure.optimizeLabels()
    if (context.isTypst) return apigeomFigureToSvg(figure)
    return context.isHtml
      ? figure.getStaticHtml({ center: true })
      : figure.tikz()
  }

  enonce(xA?: number, yA?: number) {
    if (xA == null || yA == null) {
      xA = randint(-3, 3, [0])
      yA = randint(-3, 3, [xA])
    }
    const figure = this.construireFigure(xA, yA)

    this.consigne = `Dans le repère ci-dessous, on a placé le point $A$.<br>
${figure}`

    this.question = addMultiMathfield(this, 0, {
      dataTemplate: `Quelles sont les coordonnées du point $A$ ? %{champ1}`,
      dataOptions: {
        champ1: { keyboard: KeyboardType.lyceeClassique, ldots: true },
      },
    })

    this.reponse = {
      champ1: { value: `(${xA};${yA})`, options: { coordonnees: true } },
    }

    this.correction = `On lit l'abscisse sur l'axe horizontal et l'ordonnée sur l'axe vertical.<br>
Les coordonnées du point $A$ sont $${miseEnEvidence(`(${xA}\\,;\\,${yA})`)}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.enonce(-2, 2)
    } else {
      this.enonce()
    }
  }
}
