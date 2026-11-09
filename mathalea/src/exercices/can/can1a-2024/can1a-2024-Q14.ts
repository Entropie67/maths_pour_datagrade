import { droite } from '../../../lib/2d/droites'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer une équation réduite de droite'
export const interactifReady = true

export const uuid = '82123'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */

export default class EquationReduite extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecEgalEtVariable

    this.canOfficielle = false
  }

  nouvelleVersion() {
    const xA = 0
    const yA = this.canOfficielle ? -1 : randint(-1, 2)
    const xB = 3
    const yB = this.canOfficielle ? 1 : yA + randint(-2, 2, 0)
    const coeffDir = new FractionEtendue(yB - yA, xB - xA)
    const o = texteParPosition(
      'O',
      -0.3,
      -0.3,
      0,
      'black',
      1,
      'milieu',
      true,
      1,
    )
    const A = pointAbstrait(xA, yA, 'A', 'above left')
    const B = pointAbstrait(xB, yB, 'B')
    const Bx = pointAbstrait(B.x, A.y)
    const sABx = segment(A, Bx)
    const sBBx = segment(B, Bx)
    sBBx.epaisseur = 2
    sABx.epaisseur = 2
    const traceA = tracePoint(A, 'black') // Variable qui trace les points avec une croix
    const traceB = tracePoint(B, 'black') // Variable qui trace les points avec une croix
    const d = droite(A, B, '', bleuMathalea)
    d.epaisseur = 2
    traceA.taille = 3
    traceA.epaisseur = 2
    traceB.taille = 3
    traceB.epaisseur = 2
    const xmin = -5
    const ymin = -4
    const xmax = 5
    const ymax = 5
    const r1 = repere({
      xMin: xmin,
      xMax: xmax,
      xUnite: 1,
      yMin: ymin,
      yMax: ymax,
      yUnite: 1,
      thickHauteur: 0.1,
      xLabelMin: xmin + 1,
      xLabelMax: xmax - 1,
      yLabelMax: ymax - 1,
      yLabelMin: ymin + 1,
      axeXStyle: '->',
      axeYStyle: '->',
      yLabelDistance: 1,
      yLabelEcart: 0.4,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYMin: ymin,
      grilleSecondaireYMax: ymax,
      grilleSecondaireXMin: xmin,
      grilleSecondaireXMax: xmax,
    })
    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin: ymin - 0.25,
        ymax: ymax + 0.25,
        pixelsParCm: 30,
        scale: 0.6,
        center: !context.isHtml,
      },
      o,
      d,
      r1,
      traceB,
      traceA,
      labelPoint(A),
      labelPoint(B),
    )
    this.question = "Déterminer l'équation réduite de la droite $(AB)$.<br>    "
    this.question += `${objet}<br>`
    this.reponse = {
      reponse: {
        value: `y=${`${coeffDir.texFractionSimplifiee}x${ecritureAlgebrique(yA)}`}`,
        options: { egaliteExpression: true },
      },
    }
    this.correction = `En utilisant les deux points $A$ et $B$, on détermine le coefficient directeur $m$ de la droite : <br>
    $m=\\dfrac{y_B-y_A}{x_B-x_A}=${coeffDir.texFractionSimplifiee}$.<br>
         L'ordonnée à l'origine est $${yA}$, ainsi l'équation réduite de la droite est `

    this.correction += `${
      yA !== 0
        ? `$${miseEnEvidence(`y=${coeffDir.texFractionSimplifiee}x${ecritureAlgebrique(yA)}`)}$.`
        : `$${miseEnEvidence(`y=${coeffDir.texFractionSimplifiee}x`)}$.`
    }
`
  }
}
