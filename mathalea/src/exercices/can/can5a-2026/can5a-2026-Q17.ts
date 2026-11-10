import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  "Calculer l'aire d'un triangle à partir de la base et de la hauteur"
export const interactifReady = true

export const uuid = '3hsdf'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q17 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(AB?: number, CH?: number, AH?: number, AC?: number, BC?: number) {
    if (AB == null || CH == null || AH == null || AC == null || BC == null) {
      const listeCas = [
        [10, 4, 3, 5, 8],
        [6, 4, 2, 4.5, 5.7],
        [8, 6, 4, 7, 7],
        [12, 5, 6, 7.8, 7.8],
        [14, 6, 7, 9, 9],
        [16, 4, 8, 9, 9],
        [10, 6, 5, 8, 8],
        [12, 4, 6, 7, 7],
        [8, 5, 4, 6.4, 6.4],
        [14, 4, 7, 8, 8],
      ]
      const cas = choice(listeCas)
      AB = cas[0]
      CH = cas[1]
      AH = cas[2]
      AC = cas[3]
      BC = cas[4]
    }

    const aire = (AB * CH) / 2

    // Construction de la figure
    const A = pointAbstrait(0, 0, 'A')
    const B = pointAbstrait(AB, 0, 'B')
    const H = pointAbstrait(AH, 0, 'H')
    const C = pointAbstrait(AH, CH, 'C')

    const objets = []

    // Triangle avec noms
    const pol = polygoneAvecNom(A, B, C)
    objets.push(pol[0], pol[1])

    // Hauteur [CH]
    objets.push(segment(C, H, 'gray'), codageAngleDroit(B, H, C))

    // Cotations des longueurs AC, BC, CH
    objets.push(
      latex2d(
        `${texNombre(AC)} \\text{ cm}`,
        milieu(A, C).x - 2,
        milieu(A, C).y,
        { color: 'black' },
      ),
      latex2d(
        `${texNombre(BC)} \\text{ cm}`,
        milieu(B, C).x + 2,
        milieu(B, C).y,
        { color: 'black' },
      ),
      latex2d(`${CH} \\text{ cm}`, milieu(C, H).x + 0.5, milieu(C, H).y, {
        color: 'black',
        orientation: 90,
      }),
    )

    // Cotation AB avec double flèche
    const segCotation = segment(pointAbstrait(0, -1), pointAbstrait(AB, -1))
    segCotation.styleExtremites = '<->'
    objets.push(
      segCotation,
      latex2d(`${AB} \\text{ cm}`, milieu(A, B).x, -1.8, { color: 'black' }),
    )

    // Label H
    objets.push(latex2d('H', H.x - 0.5, H.y + 0.5, { color: 'black' }))

    const graphique = mathalea2d(
      {
        xmin: -2,
        ymin: -3,
        xmax: AB + 2,
        ymax: CH + 2,
        pixelsParCm: 20,
        mainlevee: false,
        scale: 0.5,
        center: !context.isHtml,
      },
      objets,
    )

    this.canEnonce = "L'aire du triangle $ABC$ est égale à : " + graphique
    this.question = "L'aire du triangle ABC est égale à :" + graphique

    this.correction = `L'aire du triangle $ABC$ est égale à :<br>
$\\mathcal{A}=\\dfrac{AB \\times CH}{2}=\\dfrac{${AB} \\times ${CH}}{2}=\\dfrac{${AB * CH}}{2}=${miseEnEvidence(aire)}\\text{ cm}^2$`

    this.reponse = aire
    this.canReponseACompleter = '$\\ldots \\text{ cm}^2$'

    if (this.interactif) {
      this.optionsChampTexte = { texteApres: '$\\text{ cm}^2$' }
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(10, 4, 3, 5, 8)
    else this.enonce()
  }
}
