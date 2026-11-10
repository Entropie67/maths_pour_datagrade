import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../../lib/2d/placeLatexSurSegment'
import { latex2d } from '../../../lib/2d/textes'
import {
  arete3d,
  CodageAngleDroit3D,
  point3d,
  polygone3d,
} from '../../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'

import { pyramide3d } from '../../../lib/3d/3dProjectionMathalea2d/Pyramide3dPerspectiveCavaliere'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '47v56'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Volume (Métropole Juin 2025)'
export const dateDePublication = '27/05/2025'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleJ25EX3Q6 extends ExerciceQcmA {
  private appliquerLesValeurs(a: number, b: number, c: number): void {
    const point1 = point3d(0, 0, 0, true)
    const point2 = point3d(8, -1, 0, true)
    const point3 = point3d(9, 4, 0, true)
    const point4 = point3d(1, 5, 0, false)
    const base = polygone3d(point1, point2, point3, point4)
    const centre = point3d(4.5, 2, 0, false)
    const sommet = point3d(4.5, 2, 7, true)
    const hauteur = arete3d(centre, sommet, 'black', false)
    const diag1 = arete3d(point1, point3, 'black', false)
    const diag2 = arete3d(point2, point4, 'black', false)
    const pyr = pyramide3d(base, sommet, 'black', centre)
    const ang = new CodageAngleDroit3D(point1, centre, sommet)
    const l = placeLatexSurSegment(
      `${texNombre(b, 1)}\\text{ cm}`,
      point2.c2d,
      point1.c2d,
      { letterSize: 'scriptsize' },
    )
    const p = placeLatexSurSegment(
      `${texNombre(a, 1)}\\text{ cm}`,
      point3.c2d,
      point2.c2d,
      { letterSize: 'scriptsize' },
    )
    const h = latex2d(`${texNombre(c, 1)}\\text{ cm}`, 4.7, 3, {
      letterSize: 'scriptsize',
    })

    const objets = [pyr.c2d, hauteur.c2d, diag1.c2d, diag2.c2d, ang, l, p, h]
    const figure = mathalea2d(
      Object.assign({ display: 'inline-block' } as const, fixeBordures(objets)),
      objets,
    )

    this.reponses = [
      `$${texNombre((a * b * c) / 3, 2)}\\text{ cm}^3$`,
      `$${texNombre(a * b * c, 2)}\\text{ cm}^3$`,
      `$${texNombre((a * b * c) / 2, 2)}\\text{ cm}^3$`,
      `$${texNombre(a + b + c, 2)}\\text{ cm}^3$`,
    ]
    this.enonce =
      'Quel est le volume de cette pyramide à base rectangulaire ?' + figure

    this.correction = `Le volume d'une pyramide à base rectangulaire est donné par la formule $V = \\frac{1}{3} \\times \\text{aire de la base} \\times \\text{hauteur}$.<br>
    Ici, l'aire de la base est $${texNombre(a * b, 1)}\\,\\text{cm}^2$ et la hauteur est $${texNombre(c, 1)}\\,\\text{cm}$.<br>
    Donc le volume de la pyramide est $V = \\frac{1}{3} \\times ${texNombre(a * b, 1)}\\,\\text{cm}^2 \\times ${texNombre(c, 1)}\\,\\text{cm} = ${texNombre((a * b * c) / 3, 2)}\\,\\text{cm}^3$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(7, 4, 12)
  }

  versionAleatoire: () => void = () => {
    const coeff = choice([1, 3, 5, 7, 9]) * 0.5
    const [a, b, c] = [30, 40, 50].map((el) => el * coeff)
    this.appliquerLesValeurs(a, b, c + 3)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
