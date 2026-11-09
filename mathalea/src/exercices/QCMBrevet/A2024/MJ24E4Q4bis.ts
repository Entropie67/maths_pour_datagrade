import { cercle } from '../../../lib/2d/cercle'

import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { Polygone, polygone } from '../../../lib/2d/polygones'
import { polyline } from '../../../lib/2d/Polyline'
import { latex2d } from '../../../lib/2d/textes'
import { rotation } from '../../../lib/2d/transformations'
import { choice } from '../../../lib/outils/arrayOutils'
import { rotationAnimee } from '../../../modules/2dAnimation'
import { mathalea2d } from '../../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '2c2db'
export const refs = {
  'fr-fr': ['3G1QCM-5'],
  'fr-ch': ['10CTES2A-4', '10LCES2A-4', '10LSES2A-4'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Rotations (2024 Métropole sujet de secours)'
export const dateDePublication = '05/01/2025'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export function rose(nbSecteurs: number): NestedObjetMathalea2dArray {
  const rose: NestedObjetMathalea2dArray = []
  const angleRot = 360 / nbSecteurs
  const O = pointAbstrait(0, 0, 'O', 'above right')
  const A = pointAbstrait(-4, 0)
  const B = rotation(pointAbstrait(-5, 0), O, -angleRot / 2)
  const C = rotation(A, O, -angleRot)
  const enveloppe = cercle(O, 5)
  const poly = polygone([O, A, B, C])
  poly.color = colorToLatexOrHTML('black')
  poly.couleurDeRemplissage = colorToLatexOrHTML('gray')
  rose.push(poly, enveloppe)
  for (let i = 1; i < nbSecteurs; i++) {
    const aPrime = rotation(A, O, -i * angleRot)
    const bPrime = rotation(B, O, -i * angleRot)
    const cPrime = rotation(C, O, -i * angleRot)
    const polyPrime = polyline([aPrime, bPrime, cPrime, O], 'black')
    const numero = latex2d(
      String(i),
      (aPrime.x + bPrime.x + cPrime.x + O.x) / 4,
      (aPrime.y + bPrime.y + cPrime.y + O.y) / 4,
      { color: 'black' },
    )
    rose.push(polyPrime, numero)
  }
  return rose
}
export default class MetropoleJuin24Exo4BisQ4 extends ExerciceQcmA {
  private appliquerLesValeurs(
    nbSecteurs: number,
    nbSecteursRot: number,
    sens: boolean,
  ): void {
    // sens = true => sens trigo
    const rosa = rose(nbSecteurs)
    const angleRot = 360 / nbSecteurs
    const good = sens ? nbSecteurs - nbSecteursRot : nbSecteursRot
    const distracteur1 = sens ? nbSecteursRot : nbSecteurs - nbSecteursRot
    const distracteur2 = sens
      ? nbSecteursRot - 1
      : nbSecteurs + 1 - nbSecteursRot
    this.reponses = [
      `Motif $${good}$`,
      `Motif $${distracteur1}$`,
      `Motif $${distracteur2}$`,
    ]
    const poly = polygone((rosa[0] as Polygone).listePoints)
    poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
    const polyAnim = rotationAnimee(
      [poly],
      pointAbstrait(0, 0),
      angleRot * nbSecteursRot * (sens ? 1 : -1),
    )
    const lab = latex2d('O', -0.5, -0.5, {
      color: 'black',
      letterSize: 'normalsize',
    })
    if (!this.sup3) {
      this.enonce = mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: 0.5 },
          fixeBordures([rosa, lab]),
        ),
        rosa,
        lab,
      )
    } else this.enonce = ''
    this.enonce += `Quelle est l'image du motif gris par la rotation de centre $O$ et d'angle $${angleRot * nbSecteursRot}^\\circ$ dans le sens ${
      sens ? 'antihoraire' : 'horaire'
    } ?`

    this.correction = `L'image du motif gris dans la rotation de centre $O$ et d'angle $${angleRot * nbSecteursRot}^\\circ$ dans le sens ${
      sens ? 'antihoraire' : 'horaire'
    } est le motif $${good}$.<br>`
    this.correction += mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 0.5 },
        fixeBordures([rosa, polyAnim]),
      ),
      rosa,
      polyAnim,
    )
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(16, 4, true)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const nbSecteurs = choice([6, 8, 12])
      let nbSecteursRot: number
      switch (nbSecteurs) {
        case 6:
          nbSecteursRot = 2
          break
        case 8:
          nbSecteursRot = choice([2, 3])
          break
        case 12:
        default:
          nbSecteursRot = choice([2, 3, 4, 5])
          break
      }
      const sens = choice([true, false])
      this.appliquerLesValeurs(nbSecteurs, nbSecteursRot, sens)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.besoinFormulaire3CaseACocher = ['Figure masquée', false]
    this.versionAleatoire()
  }
}
