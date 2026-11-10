import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { latex2d } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  "Calculer un côté de l'angle droit dans un triangle rectangle"
export const interactifReady = true

export const uuid = 'pp1p2'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q13 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.formatInteractif = 'fillInTheBlank'
  }

  enonce(cote?: number, hypotenuse?: number) {
    if (cote == null || hypotenuse == null) {
      // Version aléatoire - couples [côté, hypoténuse] donnant des résultats non entiers
      const listeCas = [
        [4, 7], // √(49-16) = √33
        [5, 8], // √(64-25) = √39
        [3, 6], // √(36-9) = √27
        [4, 6], // √(36-16) = √20
        [5, 7], // √(49-25) = √24
        [3, 7], // √(49-9) = √40
        [6, 8], // √(64-36) = √28
        [4, 8], // √(64-16) = √48
        [5, 9], // √(81-25) = √56
        [4, 7], // √(49-16) = √33
        [5, 8], // √(64-25) = √39
        [3, 6], // √(36-9) = √27
        [4, 6], // √(36-16) = √20
        [5, 7], // √(49-25) = √24
        [3, 7], // √(49-9) = √40
        [6, 8], // √(64-36) = √28
        [4, 8], // √(64-16) = √48
        [5, 9], // √(81-25) = √56
      ]

      const cas = choice(listeCas)
      cote = cas[0]
      hypotenuse = cas[1]
    }

    const c2 = hypotenuse ** 2 - cote ** 2

    this.reponse = {
      champ1: { value: c2, options: { nombreDecimalSeulement: true } },
    }

    // Construction unique du triangle pour les deux versions
    // Angle aléatoire pour varier l'orientation
    const angleBA = this.canOfficielle ? 30 : randint(20, 50)
    const angleRad = (angleBA * Math.PI) / 180

    // B en bas à gauche, angle droit en B
    const B = pointAbstrait(0, 0, 'B')

    // A à distance 'cote' de B avec un angle angleBA
    const A = pointAbstrait(
      cote * Math.cos(angleRad),
      cote * Math.sin(angleRad),
      'A',
    )

    // C perpendiculaire à BA (angle droit en B)
    const angleBC = angleBA + 90
    const angleBCRad = (angleBC * Math.PI) / 180
    const longueurBC = Math.sqrt(c2)
    const C = pointAbstrait(
      longueurBC * Math.cos(angleBCRad),
      longueurBC * Math.sin(angleBCRad),
      'C',
    )

    const pol = polygoneAvecNom(C, B, A)
    const objets = []
    objets.push(pol[0], pol[1], codageAngleDroit(C, B, A))
    objets.push(
      latex2d(
        `${texNombre(hypotenuse)} \\text{ cm}`,
        milieu(C, A).x,
        milieu(C, A).y + 1,
        { color: 'black' },
      ),
      latex2d(
        `${texNombre(cote)} \\text{ cm}`,
        milieu(B, A).x + 1,
        milieu(B, A).y - 0.5,
        { color: 'black' },
      ),
    )

    const xmin = Math.min(A.x, B.x, C.x) - 1
    const ymin = Math.min(A.y, B.y, C.y) - 1
    const xmax = Math.max(A.x, B.x, C.x) + 2
    const ymax = Math.max(A.y, B.y, C.y) + 1.5

    this.consigne = mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 20,
        mainlevee: false,
        amplitude: 0.3,
        scale: 0.7,
        center: !context.isHtml,
      },
      objets,
    )

    this.question = `BC=\\sqrt{%{champ1}}\\text{ cm}`
    this.canEnonce = mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 20,
        mainlevee: false,
        amplitude: 0.3,
        scale: 0.7,
        center: !context.isHtml,
      },
      objets,
    )

    if (!this.interactif) {
      this.question = 'BC=\\sqrt{\\rule{0pt}{3ex}\\ldots}\\text{ cm}.'
    }

    this.correction = `On utilise le théorème de Pythagore dans le triangle $ABC$, rectangle en $B$.<br>
$\\begin{aligned}
AB^2+BC^2&=AC^2\\\\
BC^2&=AC^2-AB^2\\\\
BC^2&=${hypotenuse}^2-${cote}^2\\\\
BC^2&=${hypotenuse ** 2}-${cote ** 2}\\\\
BC^2&=${c2}\\\\
BC&=\\sqrt{${miseEnEvidence(`${c2}`)}}\\text{ cm}
\\end{aligned}$`

    this.canReponseACompleter =
      '$BC=\\sqrt{\\rule{0pt}{3ex}\\ldots}\\text{ cm}$'
    this.canReponseACompleter =
      '$BC=\\sqrt{\\rule{0pt}{3ex}\\ldots}\\text{ cm}$'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(5, 6)
    else this.enonce()
  }
}
