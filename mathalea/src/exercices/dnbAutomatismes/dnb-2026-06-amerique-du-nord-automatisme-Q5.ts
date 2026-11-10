import Figure from 'apigeom'
import type Point from 'apigeom/src/elements/points/Point'
import { apigeomFigureToSvg } from '../../lib/apigeom/apigeom-figure'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'f5d8e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1ES5A-6', '9R2ES5A-6', '9R3ES5A-6', 'PRQPF02A-6'],
}
export const interactifReady = true

export const titre = "Lire les coordonnées d'un point dans un repère"
export const dateDePublication = '06/06/2026'

/**
 * DNB Amérique du Nord juin 2026 - Question 5
 * @author Rémi Angot
 */
export default class AutoQ5ANbrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'multi-mathfield'
  }

  private construireFigure(
    xA: number,
    yA: number,
    xB: number,
    yB: number,
  ): string {
    const xMin = -5
    const xMax = 5
    const yMin = -5
    const yMax = 5
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
    figure.create('Point', {
      x: xB,
      y: yB,
      label: 'B',
      shape: 'x',
      color: 'black',
    }) as Point
    figure.optimizeLabels()
    if (context.isTypst) return apigeomFigureToSvg(figure)
    return context.isHtml
      ? figure.getStaticHtml({ center: true })
      : figure.tikz()
  }

  enonce(xA?: number, yA?: number, xB?: number, yB?: number) {
    if (xA == null || yA == null || xB == null || yB == null) {
      xA = randint(-3, 2, [0])
      yA = randint(-2, 3, [0, xA])
      xB = randint(-3, 2, [0, xA, yA])
      yB = randint(-2, 3, [0, xA, yA, xB])
    }
    const figure = this.construireFigure(xA, yA, xB, yB)

    // La figure et l'introduction restent dans la consigne (HTML).
    this.consigne = `Dans le repère ci-dessous, on a placé deux points $A$ et $B$.<br>
${figure}`

    // Les deux questions et leurs champs de réponse sont dans le multiMathfield.
    this.question = addMultiMathfield(this, 0, {
      dataTemplate: `a) Quelle est l'abscisse du point $A$ ? %{champ1}\nb) Quelles sont les coordonnées du point $B$ ? %{champ2}`,
      dataOptions: {
        champ1: { keyboard: KeyboardType.lyceeClassique, ldots: true },
        champ2: { keyboard: KeyboardType.lyceeClassique, ldots: true },
      },
    })

    this.reponse = {
      champ1: { value: xA },
      champ2: { value: `(${xB};${yB})`, options: { coordonnees: true } },
    }

    this.correction = `On lit l'abscisse sur l'axe horizontal et l'ordonnée sur l'axe vertical.<br>
${numAlpha(0)}L'abscisse du point $A$ est $${miseEnEvidence(`${xA}`)}$.<br>
${numAlpha(1)}Les coordonnées du point $B$ sont $${miseEnEvidence(`(${xB}\\,;\\,${yB})`)}$.`
  }

  nouvelleVersion() {
    // A(−2 ; 2) et B(−2 ; −1)
    if (this.canOfficielle) {
      this.enonce(-2, 2, -2, -1)
    } else {
      this.enonce()
    }
  }
}
