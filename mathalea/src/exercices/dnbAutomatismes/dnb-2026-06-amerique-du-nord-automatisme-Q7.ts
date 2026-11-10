import Figure from 'apigeom'
import type Point from 'apigeom/src/elements/points/Point'
import { apigeomFigureToSvg } from '../../lib/apigeom/apigeom-figure'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'b7f1a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Choisir la formule de trigonométrie adaptée'
export const dateDePublication = '06/06/2026'

/**
 * DNB Amérique du Nord juin 2026 - Question 7
 * Triangle ABC rectangle en A, angle en B.
 * Quatre scénarios :
 *   1. adjacent AB connu → cherche hypoténuse BC  (BC = AB / cos B)
 *   2. hypoténuse BC connue → cherche adjacent AB  (AB = BC × cos B)
 *   3. opposé AC connu → cherche hypoténuse BC     (BC = AC / sin B)
 *   4. hypoténuse BC connue → cherche opposé AC    (AC = BC × sin B)
 * @author Rémi Angot
 */

type Scenario = 1 | 2 | 3 | 4

export default class AutoQ7ANbrevet2026 extends ExerciceQcmA {
  private construireFigure(
    valeur: number,
    angle: number,
    scenario: Scenario,
  ): string {
    const figure = new Figure({
      xMin: -1,
      yMin: -1,
      width: 260,
      height: 240,
      pixelsPerUnit: 38,
    })
    figure.options.color = 'black'
    const A = figure.create('Point', {
      x: 0,
      y: 0,
      label: 'A',
      shape: '',
      labelDxInPixels: -10,
    }) as Point
    const B = figure.create('Point', {
      x: 3,
      y: 0,
      label: 'B',
      shape: '',
    }) as Point
    const C = figure.create('Point', {
      x: 0,
      y: 4,
      label: 'C',
      shape: '',
    }) as Point

    figure.create('Segment', { point1: A, point2: B })
    figure.create('Segment', { point1: A, point2: C })
    figure.create('Segment', { point1: B, point2: C })
    figure.create('MarkRightAngle', {
      point: A,
      directionPoint: B,
      size: 0.3,
      quadrant: 1,
    })
    figure.create('TextByPosition', { x: 2.2, y: 0.35, text: `${angle}°` })

    if (scenario === 1) {
      // adjacent AB connu
      figure.create('TextByPosition', { x: 1.5, y: -0.4, text: `${valeur} cm` })
    } else if (scenario === 2 || scenario === 4) {
      // hypoténuse BC connue
      figure.create('TextByPosition', { x: 1.9, y: 2.3, text: `${valeur} cm` })
    } else {
      // scenario === 3 : opposé AC connu
      figure.create('TextByPosition', { x: -0.7, y: 2, text: `${valeur} cm` })
    }

    figure.optimizeLabels()
    if (context.isTypst) return apigeomFigureToSvg(figure)
    if (!context.isHtml) return figure.tikz()
    return figure.getStaticHtml({ center: true })
  }

  private appliquerLesValeurs(
    valeur: number,
    angle: number,
    scenario: Scenario,
  ): void {
    const figure = this.construireFigure(valeur, angle, scenario)
    const v = valeur
    const a = angle

    if (scenario === 1) {
      this.enonce = `On considère un triangle $ABC$ rectangle en $A$ tel que :<br>
$\\bullet$ $AB=${v}$ cm ;<br>
$\\bullet$ $\\widehat{ABC}=${a}°$.<br>
${figure}<br>
Quelle est la formule qui permet d'obtenir la longueur $BC$ ?`

      this.correction = `Dans le triangle $ABC$ rectangle en $A$, $[BC]$ est l'hypoténuse et $[AB]$ est le côté adjacent à l'angle $\\widehat{ABC}$.<br>
On utilise donc le cosinus :<br>
$\\cos(\\widehat{ABC})=\\dfrac{AB}{BC}$ d'où $BC=\\dfrac{AB}{\\cos(\\widehat{ABC})}$.<br>
La formule cherchée est $${miseEnEvidence(`\\dfrac{${v}}{\\cos(${a})}`)}$.`

      this.reponses = [
        `$\\dfrac{${v}}{\\cos(${a})}$`,
        `$${v}\\times \\cos(${a})$`,
        `$\\dfrac{${v}}{\\sin(${a})}$`,
        `$${v}\\times \\sin(${a})$`,
      ]
    } else if (scenario === 2) {
      this.enonce = `On considère un triangle $ABC$ rectangle en $A$ tel que :<br>
$\\bullet$ $BC=${v}$ cm ;<br>
$\\bullet$ $\\widehat{ABC}=${a}°$.<br>
${figure}<br>
Quelle est la formule qui permet d'obtenir la longueur $AB$ ?`

      this.correction = `Dans le triangle $ABC$ rectangle en $A$, $[BC]$ est l'hypoténuse et $[AB]$ est le côté adjacent à l'angle $\\widehat{ABC}$.<br>
On utilise donc le cosinus :<br>
$\\cos(\\widehat{ABC})=\\dfrac{AB}{BC}$ d'où $AB=BC\\times \\cos(\\widehat{ABC})$.<br>
La formule cherchée est $${miseEnEvidence(`${v}\\times \\cos(${a})`)}$.`

      this.reponses = [
        `$${v}\\times \\cos(${a})$`,
        `$${v}\\times \\sin(${a})$`,
        `$\\dfrac{${v}}{\\sin(${a})}$`,
        `$\\dfrac{${v}}{\\cos(${a})}$`,
      ]
    } else if (scenario === 3) {
      this.enonce = `On considère un triangle $ABC$ rectangle en $A$ tel que :<br>
$\\bullet$ $AC=${v}$ cm ;<br>
$\\bullet$ $\\widehat{ABC}=${a}°$.<br>
${figure}<br>
Quelle est la formule qui permet d'obtenir la longueur $BC$ ?`

      this.correction = `Dans le triangle $ABC$ rectangle en $A$, $[BC]$ est l'hypoténuse et $[AC]$ est le côté opposé à l'angle $\\widehat{ABC}$.<br>
On utilise donc le sinus :<br>
$\\sin(\\widehat{ABC})=\\dfrac{AC}{BC}$ d'où $BC=\\dfrac{AC}{\\sin(\\widehat{ABC})}$.<br>
La formule cherchée est $${miseEnEvidence(`\\dfrac{${v}}{\\sin(${a})}`)}$.`

      this.reponses = [
        `$\\dfrac{${v}}{\\sin(${a})}$`,
        `$${v}\\times \\sin(${a})$`,
        `$\\dfrac{${v}}{\\cos(${a})}$`,
        `$${v}\\times \\cos(${a})$`,
      ]
    } else {
      this.enonce = `On considère un triangle $ABC$ rectangle en $A$ tel que :<br>
$\\bullet$ $BC=${v}$ cm ;<br>
$\\bullet$ $\\widehat{ABC}=${a}°$.<br>
${figure}<br>
Quelle est la formule qui permet d'obtenir la longueur $AC$ ?`

      this.correction = `Dans le triangle $ABC$ rectangle en $A$, $[BC]$ est l'hypoténuse et $[AC]$ est le côté opposé à l'angle $\\widehat{ABC}$.<br>
On utilise donc le sinus :<br>
$\\sin(\\widehat{ABC})=\\dfrac{AC}{BC}$ d'où $AC=BC\\times \\sin(\\widehat{ABC})$.<br>
La formule cherchée est $${miseEnEvidence(`${v}\\times \\sin(${a})`)}$.`

      this.reponses = [
        `$${v}\\times \\sin(${a})$`,
        `$${v}\\times \\cos(${a})$`,
        `$\\dfrac{${v}}{\\sin(${a})}$`,
        `$\\dfrac{${v}}{\\cos(${a})}$`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    // BC = 5 cm, angle = 60° → AB = 5 × cos(60) [scénario 2, version officielle]
    this.appliquerLesValeurs(5, 60, 2)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    let compteur = 0
    do {
      const scenario = choice([1, 2, 3, 4] as Scenario[])
      const valeur = choice([5, 6, 7, 8, 10])
      const angle = choice([30, 40, 50, 60])
      this.appliquerLesValeurs(valeur, angle, scenario)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options = { vertical: true, radio: true }
  }
}
