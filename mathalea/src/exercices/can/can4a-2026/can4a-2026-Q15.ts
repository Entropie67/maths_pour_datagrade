import { afficheMesureAngle } from '../../../lib/2d/AfficheMesureAngle'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un angle dans un triangle rectangle'
export const interactifReady = true

export const uuid = '4lpbc'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ15 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '$^\\circ$' }
  }

  enonce(angleConnu?: number) {
    if (angleConnu == null) {
      angleConnu = randint(4, 12) * 5 // Angles de 20° à 60° par pas de 5°
    }

    const angleInconnu = 90 - angleConnu

    // Triangle rectangle en B
    // B en bas à gauche (angle droit), A en bas à droite, C en haut
    const B = pointAbstrait(0, 0, 'B')
    const A = pointAbstrait(5, 0, 'A')
    const C = pointAbstrait(0, 3, 'C')

    const pol = polygoneAvecNom(B, A, C)
    const triangle = pol[0]
    const labels = pol[1]

    // Codage angle droit en B
    const angleDroit = codageAngleDroit(C, B, A)

    // Affichage de l'angle connu en A
    const angleA = afficheMesureAngle(
      B,
      A,
      C,
      'black',
      0.8,
      `${angleConnu}^\\circ`,
    )

    // Affichage de l'angle cherché en C
    const angleC = afficheMesureAngle(A, C, B, 'black', 0.8, '?')

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = angleInconnu

    const xmin = Math.min(B.x, A.x, C.x) - 1
    const ymin = Math.min(B.y, A.y, C.y) - 1
    const xmax = Math.max(B.x, A.x, C.x) + 1
    const ymax = Math.max(B.y, A.y, C.y) + 1

    this.question = mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 30,
        mainlevee: false,
        amplitude: 0.3,
        scale: 0.7,
        center: !context.isHtml,
      },
      [triangle, labels, angleDroit, angleA, angleC],
    )

    this.correction = `Le triangle $ABC$ est rectangle en $B$.<br>
La somme des angles d'un triangle est égale à $180^\\circ$, donc :<br>
$\\widehat{BCA}+\\widehat{CAB}+90^\\circ=180^\\circ$<br>
$\\widehat{BCA}+${angleConnu}^\\circ+90^\\circ=180^\\circ$<br>
$\\widehat{BCA}=180^\\circ-${angleConnu}^\\circ-90^\\circ=${miseEnEvidence(angleInconnu)}^\\circ$`

    this.canReponseACompleter = '$?=\\ldots^\\circ$'

    if (this.interactif) {
      this.question += '<br>$?=$'
    } else if (context.isHtml) {
      this.question += '<br>$?=\\ldots^\\circ$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(25)
    else this.enonce()
  }
}
