import { cercle } from '../../../lib/2d/cercle'
import { droite, droiteParPointEtPente } from '../../../lib/2d/droites'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { rotation, symetrieAxiale } from '../../../lib/2d/transformations'
import {
  pointIntersectionCC,
  pointIntersectionDD,
} from '../../../lib/2d/utilitairesPoint'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Symétrie axiale'
export const interactifReady = true

export const uuid = 'a343r'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q12 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number, alpha?: number) {
    if (a == null || b == null || c == null || alpha == null) {
      a = 5 + randint(1, 15) / 10
      const s = choice([-1, 1])
      b = 5 + (s * randint(1, 5)) / 10
      c = 5 + (-s * randint(1, 5)) / 10
      alpha = randint(6, 12, 9) * 10
    }
    const point2 =
      alpha < 90
        ? pointAbstrait(1, Math.tan((alpha * Math.PI) / 180))
        : pointAbstrait(-1, -Math.tan((alpha * Math.PI) / 180))
    const d = droite(pointAbstrait(0, 0), point2)
    const dMin = droiteParPointEtPente(
      pointAbstrait(0, alpha < 90 ? -2 : -1),
      0,
    )
    const dMax = droiteParPointEtPente(pointAbstrait(0, alpha > 90 ? 7 : 6), 0)
    const pointSd1 = pointIntersectionDD(d, dMin)
    const pointSd2 = pointIntersectionDD(d, dMax)
    const sd = segment(pointSd1, pointSd2)
    const A = pointAbstrait(-2, 0)
    const Bprime = pointAbstrait(a - 2, 0)
    const B = rotation(Bprime, A, alpha)
    const c1 = cercle(B, b)
    const c2 = cercle(A, c)
    const C = pointIntersectionCC(c1, c2, '', 0)
    const Cprime = pointIntersectionCC(c1, c2, '', 1)
    const CC = Cprime.x > C.x ? C : Cprime
    const triangle1 = polygone(A, B, CC)
    const triangle2 = symetrieAxiale(triangle1, d)
    const nom = nommePolygone(triangle2, 'CED', 0.5, 'black', 0.8)

    const l1 = placeLatexSurSegment(
      `${texNombre(a, 1)}\\text{ cm}`,
      triangle1.listePoints[1],
      triangle1.listePoints[0],
      { distance: 0.5, letterSize: 'footnotesize' },
    )
    const l2 = placeLatexSurSegment(
      `${texNombre(b, 1)}\\text{ cm}`,
      triangle1.listePoints[2],
      triangle1.listePoints[1],
      { distance: 0.5, letterSize: 'footnotesize' },
    )
    const l3 = placeLatexSurSegment(
      `${texNombre(c, 1)}\\text{ cm}`,
      triangle1.listePoints[0],
      triangle1.listePoints[2],
      { distance: 0.5, letterSize: 'footnotesize' },
    )
    const bordures = fixeBordures([triangle1, sd, triangle2, nom])
    context.fenetreMathalea2d = [
      bordures.xmin,
      bordures.ymin,
      bordures.xmax,
      bordures.ymax,
    ]
    const labelD = latex2d('(d)', pointSd1.x - 0.6, pointSd1.y, {
      letterSize: 'footnotesize',
    })
    this.reponse = c.toFixed(1)
    this.question = `Les deux triangles sont symétriques par rapport à la droite (d).<br>
    ${mathalea2d(Object.assign({ scale: 0.35 }, fixeBordures([triangle1, labelD, triangle2, nom, sd])), [triangle1, sd, l1, l2, l3, labelD, triangle2, nom])}`
    this.correction = `La symétrie axiale conserve les longueurs.<br>
    Le segment symétrique du segment $[CD]$ est celui qui mesure $${texNombre(c, 1)}$ $\\text{cm}$, donc $CD=${miseEnEvidence(`${texNombre(c, 1)}`)}$ $\\text{cm}$.`

    this.canReponseACompleter = '$CD=\\ldots$ $\\text{cm}$'
    this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
    if (this.interactif) {
      this.question += '$CD=$'
    } else {
      this.question += 'Quelle est la longueur de $[CD]$ ?'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(6.3, 5, 6.2, 80)
    else this.enonce()
  }
}
