import { afficheMesureAngle } from '../../../lib/2d/AfficheMesureAngle'
import { codageSegments } from '../../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { degTan } from '../../../lib/mathFonctions/radToDeg'

import { miseEnEvidence } from '../../../lib/outils/embellissements'

import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un angle dans un triangle isocèle'
export const interactifReady = true

export const uuid = '3ed5d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q17 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '$^\\circ$' }
  }

  enonce(angleBase?: number) {
    if (angleBase == null) {
      // Angles de base entre 25\\circ et 55\\circ (pour avoir un angle au sommet entre 70\\circ et 130\\circ)
      angleBase = randint(5, 11) * 5
    }

    const angleSommet = 180 - 2 * angleBase

    // Construction du triangle isocèle avec les vrais angles géométriques
    // C en bas à gauche, B en bas à droite, A en haut (sommet)
    const C = pointAbstrait(0, 0, 'C')
    const B = pointAbstrait(5, 0, 'B')
    const A = pointAbstrait(2.5, 2.5 * degTan(angleBase), 'A')

    const pol = polygoneAvecNom(C, B, A)
    const triangle = pol[0] // Le tracé du triangle
    const labels = pol[1] // Les labels des points

    // Codage des côtés égaux AC et AB
    const codages = codageSegments('||', 'black', A, C, A, B)

    // Affichage de l'angle de base connu (en C)
    const angleC = afficheMesureAngle(
      B,
      C,
      A,
      'black',
      0.8,
      `${angleBase}^\\circ`,
    )

    // Affichage de l'angle cherché (en A, au sommet)
    const angleA = afficheMesureAngle(C, A, B, 'black', 0.5, '?')

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = angleSommet

    const xmin = Math.min(C.x, B.x, A.x) - 1
    const ymin = Math.min(C.y, B.y, A.y) - 1
    const xmax = Math.max(C.x, B.x, A.x) + 1
    const ymax = Math.max(C.y, B.y, A.y) + 1.5

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
      [triangle, labels, codages, angleC, angleA],
    )

    this.correction = `Le triangle $ABC$ est isocèle en $A$ (les côtés $[AC]$ et $[AB]$ sont égaux).<br>
Donc les angles à la base sont égaux : $\\widehat{ACB}=\\widehat{ABC}=${angleBase}^\\circ$.<br>
La somme des angles d'un triangle est égale à $180^\\circ$, donc :<br>
$\\widehat{CAB}+${angleBase}^\\circ+${angleBase}^\\circ=180^\\circ$<br>
$\\widehat{CAB}=180^\\circ-${angleBase}^\\circ-${angleBase}^\\circ=180^\\circ-${2 * angleBase}^\\circ=${miseEnEvidence(angleSommet)}^\\circ$`

    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canReponseACompleter = '$?=\\ldots^\\circ$'

    if (this.interactif) {
      this.question += '<br>$?=$'
    } else if (context.isHtml) {
      this.question += '<br>$?=\\ldots^\\circ$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(50)
    else this.enonce()
  }
}
