import { cercle } from '../../../lib/2d/cercle'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { pointIntersectionCC } from '../../../lib/2d/utilitairesPoint'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une longueur dans un triangle'
export const interactifReady = true

export const uuid = '97291'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q18 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(3, 7)
      b = randint(3, 9, a)
      c = randint(Math.abs(b - a) + 1, a + b - 1)
    }
    const A = pointAbstrait(0, 0, 'A', 'below left')
    const B = pointAbstrait(c, 0, 'B', 'below right')
    const C1 = cercle(A, a)
    const C2 = cercle(B, b)
    const C = pointIntersectionCC(C1, C2, 'C', 1)
    C.label = 'C'
    C.positionLabel = 'above right'
    const l1 = placeLatexSurSegment(`${a}\\text{ cm}`, A, C)
    const l2 = placeLatexSurSegment(`${b}\\text{ cm}`, C, B)
    const objets = [polygoneAvecNom(A, B, C), l1, l2]
    this.question = mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 0.5, display: 'inline-block' } as const,
        fixeBordures(objets),
      ),
      objets,
    )
    this.question += `Le périmètre de ce triangle est de $${a + b + c}\\text{ cm}$.`
    this.correction = `$AB=${a + b + c}\\text{ cm}-${a}\\text{ cm}-${b}\\text{ cm}=${miseEnEvidence(`${c}`)}\\text{ cm}$`

    this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
    if (this.interactif) {
      this.question += '<br>$AB=$'
    } else {
      this.question += '<br>$AB=\\ldots\\text{ cm}$'
    }
    this.canReponseACompleter = '$AB=\\ldots\\text{ cm}$'
    this.reponse = String(c)
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 6, 8)
    else this.enonce()
  }
}
