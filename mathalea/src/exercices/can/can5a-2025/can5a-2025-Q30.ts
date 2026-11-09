import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { latex2d } from '../../../lib/2d/textes'
import { point3d } from '../../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { pave3d } from '../../../lib/3d/3dProjectionMathalea2d/PaveEtPaveLPH3dPerspectiveCavaliere'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une longueur de pavé'
export const interactifReady = true

export const uuid = 'y3u3x'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q30 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(3, 6)
      b = randint(2, 5, a)
      c =
        (a * b) % 2 === 0
          ? (a * b) % 5 === 0
            ? choice([6, 8])
            : choice([5, 10, 15])
          : choice([10, 20])
    }
    const A = point3d(0, 0, 0)
    const B = point3d(6, 0, 0)
    const C = point3d(0, 3, 0)
    const D = point3d(0, 0, -3)
    const pav = pave3d(A, B, C, D)
    const la = latex2d(`${texNombre(a, 0)}\\text{ m}`, -0.5, -1.5, {})
    const lb = latex2d(`${texNombre(b, 0)}\\text{ m}`, 7.3, -2.7, {})
    const lc = latex2d('?\\text{ m}', 3, -3.4, {})

    const v = a * b * c
    this.reponse = c
    this.question = `${mathalea2d(Object.assign({ pixelsParCm: 30, scale: 0.6 }, fixeBordures([pav.c2d], { rxmin: -1.5, rxmax: 1.5, rymin: -1 })), [pav.c2d, la, lb, lc])}
    Le volume de ce pavé droit est de $${v}\\text{ m}^3$.<br>`
    this.correction = `On a : $${a}\\times ${b}~\\times~?=${v}$,<br>
    soit $${a * b} ~\\times ? = ${v}$,<br>
    donc $?=${v}\\div${a * b}=${miseEnEvidence(c)}\\text{ m}$.`

    this.canReponseACompleter = '$?=\\ldots\\text{ m}$'
    this.optionsChampTexte = { texteApres: '$\\text{ m}$' }
    if (this.interactif) {
      this.question += '$?=$'
    } else if (context.isHtml) {
      this.question += '$?=\\ldots\\text{ m}$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 3, 10)
    else this.enonce()
  }
}
