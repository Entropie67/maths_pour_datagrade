import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../../lib/2d/placeLatexSurSegment'
import { labelPoint } from '../../../lib/2d/textes'
import {
  CodageAngleDroit3D,
  point3d,
  polygone3d,
} from '../../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { pyramide3d } from '../../../lib/3d/3dProjectionMathalea2d/Pyramide3dPerspectiveCavaliere'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer le volume d'une pyramide à base carrée"
export const interactifReady = true

export const uuid = '45d05'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['11LCGM1B-4', '11LSGM1B-4'],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q1 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '$\\text{ cm}^3$' }
  }

  enonce(b?: number, h?: number) {
    if (b == null || h == null) {
      b = choice([3, 4, 5, 6, 8])
      h = choice([3, 6])
      if (h === 4.5 && b % 2 === 1) {
        b++
      }
    }
    const A = point3d(0, 0, 0, true, 'A', 'right')
    const B = point3d(-b, 2, 0, false, 'B', 'below')
    const C = point3d(-b - 1, -b + 2, 0, true, 'C', 'left')
    const D = point3d(-1, -b, 0, true, 'D', 'below')
    const base = polygone3d(A, B, C, D)
    const S = point3d(0, 0, h, true, 'S', 'above right')
    const pyr = pyramide3d(base, S)
    const objets: NestedObjetMathalea2dArray = [
      pyr.c2d,
      labelPoint(A.c2d, B.c2d, C.c2d, D.c2d, S.c2d),
    ]
    const ang1 = new CodageAngleDroit3D(S, A, D)
    const ang2 = new CodageAngleDroit3D(B, C, D)
    const codageBase = placeLatexSurSegment(`${b}\\text{ cm}`, D.c2d, C.c2d, {})
    const codageHauteur = placeLatexSurSegment(
      `${texNombre(h, 1)}\\text{ cm}`,
      S.c2d,
      A.c2d,

      { horizontal: true, distance: 1.5 },
    )
    objets.push(ang1, ang2, codageBase, codageHauteur)
    context.anglePerspective = 30
    this.reponse = texNombre((b * b * h) / 3, 1)
    this.question = 'Volume de cette pyramide à base carrée<br>'
    this.question += mathalea2d(
      Object.assign({}, { scale: 0.7 }, fixeBordures(objets)),
      objets,
    )
    this.correction = `$\\mathcal{V}=\\dfrac{1}{3}\\times\\mathcal{B}\\times h=\\dfrac{1}{3}\\times ${b * b}\\times ${texNombre(h, 1)}=${miseEnEvidence(this.reponse)}\\text{ cm}^3$`

    this.canReponseACompleter = '$\\ldots\\text{ cm}^3$'
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(5, 3)
    else this.enonce()
  }
}
