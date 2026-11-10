import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { droite, labelOnLine } from '../../../lib/2d/droites'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { Polygone, polygone } from '../../../lib/2d/polygones'
import { rotation } from '../../../lib/2d/transformations'
import { choice } from '../../../lib/outils/arrayOutils'
import { symetrieAnimee } from '../../../modules/2dAnimation'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
import { rose } from './MJ24E4Q4bis'

export const uuid = '3c2db'
export const refs = {
  'fr-fr': ['3G1QCM-6'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Symétrie (2024 Métropole sujet de secours)'
export const dateDePublication = '05/01/2025'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleJuin24Exo4BisQ3 extends ExerciceQcmA {
  private appliquerLesValeurs(
    nbSecteurs: number,
    nbSecteursRot: number,
    sens: boolean,
  ): void {
    // sens = true => sens trigo
    const angleRot = 360 / nbSecteurs
    const rosa = rose(nbSecteurs)
    const d = rotation(
      droite(pointAbstrait(0, 0), pointAbstrait(-5, 0)),
      pointAbstrait(0, 0),
      sens ? angleRot * nbSecteursRot : -angleRot * nbSecteursRot,
    )
    d.color = colorToLatexOrHTML('black')
    d.epaisseur = 2

    rosa.push(d)
    const poly = polygone((rosa[0] as Polygone).listePoints)
    poly.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
    const polyAnim = symetrieAnimee(poly, d)

    context.fenetreMathalea2d = [-6, -6, 6, 6]
    const lab = labelOnLine(d, '(d)', {
      preferedPosition: 'left',
      color: 'black',
      letterSize: 'normalsize',
    })
    const good = sens
      ? nbSecteurs - 1 - 2 * nbSecteursRot
      : 2 * (nbSecteursRot - 1) + 1
    const distracteur1 = nbSecteurs / 2
    const distracteur2 = nbSecteurs - 1
    this.reponses = [
      `Motif $${good}$`,
      `Motif $${distracteur1}$`,
      `Motif $${distracteur2}$`,
    ]
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
    this.enonce += `La droite $(d)$ a été tournée $${nbSecteursRot}$ fois de $${angleRot}^\\circ$ dans le sens ${sens ? 'trigonométrique' : 'horaire'}.<br>`
    this.enonce +=
      "Quelle est l'image du motif gris par la symétrie d'axe $(d)$ ?"
    this.correction = `L'image du motif gris par la symétrie d'axe $(d)$ est le motif $${good}$.<br>`
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
    this.appliquerLesValeurs(16, 3, false)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const nbSecteurs = choice([6, 8, 12])
      let nbSecteursRot: number
      switch (nbSecteurs) {
        case 6:
          nbSecteursRot = choice([1, 2])
          break
        case 8:
          nbSecteursRot = choice([1, 2, 3])
          break
        case 12:
        default:
          nbSecteursRot = choice([1, 2, 3, 4])
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
