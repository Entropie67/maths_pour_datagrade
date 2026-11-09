import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Déterminer une coordonnée'
export const interactifReady = true

export const uuid = 'z45m9'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q14 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(
    xA?: number,
    yA?: number,
    xB?: number,
    yB?: number,
    xC?: number,
    yC?: number,
    choix?: string,
  ) {
    if (
      xA == null ||
      yA == null ||
      xB == null ||
      yB == null ||
      xC == null ||
      yC == null ||
      choix == null
    ) {
      xA = randint(1, 5)
      yA = randint(3, 4)
      xB = randint(3, 5, xA)
      yB = randint(1, 2)
      xC = randint(1, 2, xA)
      yC = randint(1, 2)
      choix = choice(['a', 'b', 'c'])
    }

    const r = repere({
      xMin: -1,
      xMax: 6,
      xUnite: 1,
      yMin: -1,
      yMax: 5,
      thickHauteur: 0.2,
      xLabelMin: 1,
      xLabelMax: 5,
      yLabelMax: 4,
      yLabelMin: 1,
      axeXStyle: '->',
      axeYStyle: '->',
      yLabelDistance: 1,
      yLabelEcart: 0.6,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYMin: -1,
      grilleSecondaireYMax: 5,
      grilleSecondaireXMin: -1,
      grilleSecondaireXMax: 6,
    })
    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    const A = pointAbstrait(xA, yA, 'A', 'above')
    const B = pointAbstrait(xB, yB, 'B', 'below')
    const C = pointAbstrait(xC, yC, 'C', 'below')
    const AB = segment(A, B, bleuMathalea)
    const AC = segment(A, C, bleuMathalea)
    const BC = segment(B, C, bleuMathalea)
    AB.epaisseur = 2
    AC.epaisseur = 2
    BC.epaisseur = 2

    const graphique = mathalea2d(
      { xmin: -1, xmax: 6.1, ymin: -1, ymax: 6, pixelsParCm: 25, scale: 0.5 },
      r,
      o,
      tracePoint(A),
      tracePoint(B),
      tracePoint(C),
      labelPoint(A, B, C),
      AB,
      AC,
      BC,
    )

    if (choix === 'a') {
      this.question = "Quelle est l'abscisse  du point $A$ ?<br>" + graphique
      this.correction = `L'abscisse du point $A$ se lit sur l'axe horizontal. <br>
$x_A=${miseEnEvidence(xA)}$.`
      this.canReponseACompleter =
        "Quelle est l'abscisse  du point $A$ ?<br> $\\ldots$"
      this.reponse = xA
    } else if (choix === 'b') {
      this.question = "Quelle est l'ordonnée du point $A$ ?<br>" + graphique
      this.correction = `L'ordonnée du point $A$ se lit sur l'axe vertical. <br>
$y_A=${miseEnEvidence(yA)}$.`
      this.canReponseACompleter =
        "Quelle est l'ordonnée  du point $A$ ?<br> $\\ldots$"
      this.reponse = yA
    } else {
      this.question = "Quelle est l'abscisse  du point $B$ ?<br>" + graphique
      this.correction = `L'abscisse du point $B$ se lit sur l'axe horizontal. <br>
$x_B=${miseEnEvidence(xB)}$.`
      this.canReponseACompleter =
        "Quelle est l'abscisse  du point $B$ ?<br> $\\ldots$"
      this.reponse = xB
    }
    this.canEnonce = graphique
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 3, 4, 1, 1, 2, 'a')
    else this.enonce()
  }
}
