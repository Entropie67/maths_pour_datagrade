import { afficheCoteSegment } from '../../../lib/2d/AfficheCoteSegment'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'

import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import {
  point3d,
  polygone3d,
  vecteur3d,
} from '../../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { prisme3d } from '../../../lib/3d/3dProjectionMathalea2d/Prisme3dPerspectiveCavaliere'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '279da'
export const refs = {
  'fr-fr': ['5G2C-1'],
  'fr-2016': ['5M2QCM-1'],
  'fr-ch': ['10CTGM2A-1', '10LCGM2A-1', '10LSGM2A-1', 'PRQMG02B-3'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Calculer un volume de prisme droit (DNB Juin 2022 Amérique du Nord)'
export const dateDePublication = '08/11/2024'

/**
 * @author Jean-Claude LHOTE
 */

export default class AmeriqueNordJuin22Ex1Q5 extends ExerciceQcmA {
  private appliquerLesValeurs(l: number, h: number, p: number): void {
    const basePoints = [
      point3d(0, 0, 0, true, 'A', 'below left'),
      point3d(5, 0, 0, true, 'B', 'below left'),
      point3d(0, 0, 3, true, 'F', 'below left'),
    ]
    const base = polygone3d(...basePoints)
    for (const arete of base.aretes) {
      arete.isVisible = true
    }
    const a1 = codageAngleDroit(
      basePoints[1].c2d,
      basePoints[0].c2d,
      basePoints[2].c2d,
    )
    const vecteurExtrusion = vecteur3d(0, 8, 0)
    const lePrisme = prisme3d(base, vecteurExtrusion, 'black', false, 'DCG', [
      'above right',
      'below right',
      'above right',
      'above left',
    ])
    const base2 = lePrisme.base2.listePoints
    const a2 = codageAngleDroit(base2[1].c2d, base2[0].c2d, base2[2].c2d)
    const largeur = afficheCoteSegment(
      segment(basePoints[1].c2d, basePoints[0].c2d),
      `${l}cm`,
    )
    const hauteur = afficheCoteSegment(
      segment(basePoints[0].c2d, basePoints[2].c2d),
      `${h}cm`,
    )
    const profondeur = afficheCoteSegment(
      segment(base2[1].c2d, basePoints[1].c2d),
      `${p}cm`,
    )
    const volume = texNombre((l * h * p) / 2, 1)
    this.reponses = [
      `$${volume}\\text{ cm}^3$`,
      `$${l * p}\\text{ cm}^3$`,
      `$${l * p * h}\\text{ cm}^3$`,
      `$${(l + h) * p}\\text{ cm}^3$`,
    ]
    const objets = [lePrisme.c2d, a1, a2, largeur, hauteur, profondeur]
    this.enonce = mathalea2d(
      Object.assign({ pixelsParCm: 20, scale: 0.7 }, fixeBordures(objets)),
      objets,
    )
    this.enonce += 'Le volume de ce prisme droit est :' // un medskip pour passer à la ligne après le dessin
    this.correction = `La base de ce prisme est un triangle rectangle de $${l}\\text{ cm}$ et $${h}\\text{ cm}$ de côté.<br>
    Son aire est : $\\dfrac{${l}\\times ${h}}{2}=\\dfrac{${l * h}}{2}=${texNombre((l * h) / 2, 1)}\\text{ cm}^2$.<br>
    Le volume du prisme est le produit de l'aire de la base par la hauteur, soit :<br>
    $${texNombre((l * h) / 2, 1)}\\times ${p}=${miseEnEvidence(`${volume}\\text{ cm}^3`)}$<br>
    Nous aurions pu considérer ce prisme comme étant la moitié d'un pavé droit de dimensions : $${l}\\,\\text{cm}\\times ${h}\\,\\text{cm}\\times ${p}\\,\\text{cm}$.<br>
    On obtient le même résultat avec : $\\dfrac{${l}\\times ${h}\\times ${p}}{2}=\\dfrac{${l * p * h}}{2}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(5, 3, 8)
  }

  versionAleatoire: () => void = () => {
    const n = 4

    do {
      const l = randint(4, 7)
      const h = randint(2, l, [l])
      const p = randint(l + 1, 10)
      this.appliquerLesValeurs(l, h, p)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
