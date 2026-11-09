import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../../lib/2d/textes'
import { homothetie, translation } from '../../../lib/2d/transformations'
import { vecteur } from '../../../lib/2d/Vecteur'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Distance sur un segment'
export const interactifReady = true

export const uuid = 'byxrt'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q12 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      b = randint(11, 25)
      a = choice([true, false])
        ? randint(4, Math.round(b / 2) - 1)
        : randint(Math.round(b / 2) - 1, b - 4)
    }
    const A = pointAbstrait(0, 0, 'A', 'above')
    const C = pointAbstrait(10, 0, 'C', 'above')
    const B = homothetie(C, A, a / b, 'B', 'above')
    const sB = segment(B.x, B.y - 0.2, B.x, B.y + 0.2)
    const s = segment(A, C)
    s.styleExtremites = '|-|'
    const s2 = translation(s, vecteur(0, -0.5))
    s2.styleExtremites = '<->'
    const labels = labelPoint(A, B, C)
    const l1 = placeLatexSurSegment(texNombre(a, 0), A, B, {
      letterSize: 'footnotesize',
    })
    const l2 = placeLatexSurSegment('x', B, C, { letterSize: 'footnotesize' })
    const l3 = placeLatexSurSegment(texNombre(b, 0), A, C, {
      distance: -1,
      letterSize: 'footnotesize',
    })
    const objets = [s, s2, labels, l1, l2, l3, sB]
    this.reponse = b - a
    this.question =
      mathalea2d(
        Object.assign({ pixelsParCm: 25, scale: 0.6 }, fixeBordures(objets)),
        objets,
      ) + '<br>'

    this.correction = `$x=${b}-${a}=${miseEnEvidence(b - a)}$`
    this.canEnonce = mathalea2d(
      Object.assign({ pixelsParCm: 25, scale: 0.6 }, fixeBordures(objets)),
      objets,
    )
    this.canReponseACompleter = '$x=\\ldots\\ldots$'
    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '$x =$ ' }
    } else {
      this.question += '$x=\\ldots$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(7, 11)
    else this.enonce()
  }
}
