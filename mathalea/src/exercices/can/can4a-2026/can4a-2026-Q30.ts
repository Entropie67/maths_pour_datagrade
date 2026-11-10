import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../../lib/2d/placeLatexSurSegment'
import { polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import {
  CodageAngleDroit3D,
  homothetie3d,
  point3d,
  polygone3d,
  vecteur3d,
} from '../../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { prisme3d } from '../../../lib/3d/3dProjectionMathalea2d/Prisme3dPerspectiveCavaliere'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Calculer le volume d'un prisme droit à base triangulaire"
export const interactifReady = true

export const uuid = 'ytsqg'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ30 extends ExerciceCan {
  constructor() {
    super()
    this.optionsDeComparaison = {
      nombreDecimalSeulement: true,
    }
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  enonce(base?: number, hauteurTriangle?: number, profondeur?: number) {
    if (base == null || hauteurTriangle == null || profondeur == null) {
      base = randint(4, 8)
      hauteurTriangle = randint(3, 6)
      profondeur = randint(3, 6)
    }
    context.anglePerspective = 60
    const A = point3d(0, 0, 0, true)
    const B = point3d(5, 5, 0, true)
    const C = point3d(1, 7, 0, false)
    const D = point3d(5, 5, 5, true)
    const E = point3d(0, 0, 5)
    const F = point3d(1, 7, 5)
    const H = homothetie3d(B, A, 0.7)
    const couvercle = polygone(D.c2d, E.c2d, F.c2d)
    couvercle.couleurDeRemplissage = colorToLatexOrHTML('gray')
    couvercle.opaciteDeRemplissage = 0.3
    couvercle.color = colorToLatexOrHTML('none')
    const polyBase = polygone(A.c2d, B.c2d, C.c2d)
    polyBase.couleurDeRemplissage = colorToLatexOrHTML('gray')
    polyBase.opaciteDeRemplissage = 0.3
    polyBase.color = colorToLatexOrHTML('none')

    const triangle = polygone3d([A, B, C], '')
    const hauteur = vecteur3d(0, 0, 5)
    const prisme = prisme3d(triangle, hauteur)

    const objets = [couvercle, polyBase, prisme.c2d]
    objets.push(
      placeLatexSurSegment(`${profondeur}\\text{ cm}`, B.c2d, D.c2d, {
        color: 'black',
        letterSize: 'small',
      }),
      placeLatexSurSegment(`${base}\\text{ cm}`, B.c2d, A.c2d, {
        color: 'black',
        letterSize: 'small',
      }),
      placeLatexSurSegment(`${hauteurTriangle}\\text{ cm}`, H.c2d, C.c2d, {
        color: 'black',
        letterSize: 'small',
      }),
      segment(H.c2d, C.c2d),
      segment(D.c2d, E.c2d),
      new CodageAngleDroit3D(B, H, C),
    )

    const aireBase = (base * hauteurTriangle) / 2
    const volume = aireBase * profondeur

    this.reponse = texNombre(volume, 1)

    this.question = mathalea2d(
      Object.assign({}, { scale: 0.7 }, fixeBordures(objets)),
      objets,
    )
    this.question += 'Le volume de ce prisme droit est '
    this.correction = `L'aire de la base triangulaire est :<br>
$\\mathcal{B}=\\dfrac{${base}\\times ${hauteurTriangle}}{2}=${aireBase}\\text{ cm}^2$.<br>
Le volume du prisme est :<br>
$\\mathcal{V}=\\mathcal{B}\\times h=${aireBase}\\times ${profondeur}=${miseEnEvidence(volume)}\\text{ cm}^3$.`

    this.canReponseACompleter = '$\\ldots\\text{ cm}^3$'

    this.optionsChampTexte = { texteApres: '$\\text{ cm}^3$.' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) this.enonce(5, 2, 3)
    else this.enonce()
  }
}
