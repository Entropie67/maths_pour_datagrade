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

export const titre = "Calculer l'aire d'un triangle rectangle"
export const interactifReady = true

export const uuid = 'tsd68'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q23 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: ' $\\text{cm}^2$.' }
  }

  enonce(cote1?: number, cote2?: number, hypotenuse?: number) {
    if (cote1 == null || cote2 == null || hypotenuse == null) {
      // Triplets pythagoriciens classiques [côté1, côté2, hypoténuse]
      const triplets = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],

        [6, 8, 10],
        [9, 12, 15],

        [5, 12, 13],
      ]

      const triplet = choice(triplets)
      cote1 = triplet[0]
      cote2 = triplet[1]
      hypotenuse = triplet[2]
    }

    // Calcul de l'aire
    const aire = (cote1 * cote2) / 2

    this.reponse = aire

    // Construction du triangle
    const angleBA = this.canOfficielle ? 30 : randint(20, 50)
    const angleRad = (angleBA * Math.PI) / 180

    // A en bas à gauche, angle droit en A
    const A = pointAbstrait(0, 0, 'A')

    // B à distance 'cote2' de A avec un angle angleBA
    const B = pointAbstrait(
      cote2 * Math.cos(angleRad),
      cote2 * Math.sin(angleRad),
      'B',
    )

    // C perpendiculaire à AB (angle droit en A)
    const angleAC = angleBA + 90
    const angleACRad = (angleAC * Math.PI) / 180
    const C = pointAbstrait(
      cote1 * Math.cos(angleACRad),
      cote1 * Math.sin(angleACRad),
      'C',
    )

    const pol = polygoneAvecNom(C, A, B)
    const objets = []
    objets.push(pol[0], pol[1], codageAngleDroit(C, A, B))

    // Étiquettes des longueurs
    objets.push(
      latex2d(
        `${texNombre(hypotenuse)} \\text{ cm}`,
        milieu(C, B).x,
        milieu(C, B).y + 0.8,
        { color: 'black' },
      ),
      latex2d(
        `${texNombre(cote2)} \\text{ cm}`,
        milieu(A, B).x + 1.2,
        milieu(A, B).y - 0.5,
        { color: 'black' },
      ),
      latex2d(
        `${texNombre(cote1)} \\text{ cm}`,
        milieu(A, C).x - 1.4,
        milieu(A, C).y,
        { color: 'black' },
      ),
    )

    const xmin = Math.min(A.x, B.x, C.x) - 2
    const ymin = Math.min(A.y, B.y, C.y) - 2
    const xmax = Math.max(A.x, B.x, C.x) + 2
    const ymax = Math.max(A.y, B.y, C.y) + 2
    const figure = mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: cote1 === 3 ? 30 : 15,
        mainlevee: false,
        amplitude: 0.3,
        scale: 0.4,
        center: !context.isHtml,
      },
      objets,
    )

    this.question = `${figure}<br>L'aire du triangle $ABC$ est `

    this.correction = `L'aire d'un triangle rectangle est égale à : $\\dfrac{\\text{côté}_1\\times \\text{côté}_2}{2}$.<br>
$\\begin{aligned}
\\mathcal{A}&=\\dfrac{AB\\times AC}{2}\\\\
&=\\dfrac{${cote2}\\times ${cote1}}{2}\\\\
&=\\dfrac{${cote1 * cote2}}{2}\\\\
&=${miseEnEvidence(texNombre(aire))}\\text{ cm}^2
\\end{aligned}$`

    this.canEnonce = `${figure}<br>L'aire du triangle $ABC$ est :`
    this.canReponseACompleter = '$\\ldots$ cm$^2$'

    if (!this.interactif) {
      this.question += ' $\\ldots\\text{ cm}^2$.'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(6, 8, 10)
    else this.enonce()
  }
}
