import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { labelPoint } from '../../../lib/2d/textes'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '47u56'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Aire (Métropole Juin 2025)'
export const dateDePublication = '27/05/2025'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleJ25EX3Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    const point1 = pointAbstrait(0, 0, 'A', 'left')
    const point2 = pointAbstrait(7.5, 0, 'C', 'right')
    const point3 = pointAbstrait(4.8, 3.6, 'B', 'above')
    const tri = polygone([point1, point2, point3])
    tri.epaisseur = 1
    const ang = codageAngleDroit(point1, point3, point2)
    const l0Fig = placeLatexSurSegment(
      `${texNombre(a, 1)}\\text{ cm}`,
      point2,
      point1,
      {},
    )
    const l1Fig = placeLatexSurSegment(
      `${texNombre(b, 1)}\\text{ cm}`,
      point1,
      point3,
      {},
    )
    const l2Fig = placeLatexSurSegment(
      `${texNombre(c, 1)}\\text{ cm}`,
      point3,
      point2,
      {},
    )

    const objets = [
      tri,
      l0Fig,
      l1Fig,
      l2Fig,
      ang,
      labelPoint(point1, point2, point3),
    ]
    const figure = mathalea2d(
      Object.assign({ display: 'inline-block' } as const, fixeBordures(objets)),
      objets,
    )

    this.reponses = [
      `$${texNombre((b * c) / 2, 2)}\\text{ cm}^2$`,
      `$${texNombre(b * c, 2)}\\text{ cm}^2$`,
      `$${texNombre(a + b + c, 2)}\\text{ cm}^2$`,
      `$${texNombre((a + b + c) / 2, 2)}\\text{ cm}^2$`,
    ]
    this.enonce = `Quelle est l'aire du triangle $ABC$${sp()}?` + figure

    this.correction = `L'aire du triangle $ABC$ est donnée par la formule $\\dfrac{1}{2} \\times \\text{base} \\times \\text{hauteur}$, soit ici $\\dfrac{1}{2} \\times ${texNombre(b, 1)}\\,\\text{cm} \\times ${texNombre(c, 1)}\\,\\text{ cm} = ${texNombre((b * c) / 2, 2)}\\,\\text{cm}^2$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(7.5, 6, 4.5)
  }

  versionAleatoire: () => void = () => {
    const coeff = choice([1, 3, 5, 7, 9]) * 0.5
    const [a, b, c] = [3, 4, 5].map((el) => el * coeff)
    this.appliquerLesValeurs(a, b, c)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
