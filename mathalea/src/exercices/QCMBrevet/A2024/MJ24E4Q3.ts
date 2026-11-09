import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { labelPoint } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = 'b57a9'
export const refs = {
  'fr-fr': ['4G1QCM-1'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Image par translation (2024 Métropole)'
export const dateDePublication = '28/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleJuin24Exo4Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(
    C: string,
    A: string,
    J: string,
    E: string,
    H: string,
    D: string,
    listeLettres: string[][],
  ): void {
    const nuage = [
      pointAbstrait(0, 0, listeLettres[0][0], 'above right'),
      pointAbstrait(2, 0, listeLettres[0][1], 'above right'),
      pointAbstrait(4, 0, listeLettres[0][2], 'above right'),
      pointAbstrait(6, 0, listeLettres[0][3], 'above right'),
      pointAbstrait(0, 2, listeLettres[1][0], 'above right'),
      pointAbstrait(2, 2, listeLettres[1][1], 'above right'),
      pointAbstrait(4, 2, listeLettres[1][2], 'above right'),
      pointAbstrait(6, 2, listeLettres[1][3], 'above right'),
      pointAbstrait(0, 4, listeLettres[2][0], 'above right'),
      pointAbstrait(2, 4, listeLettres[2][1], 'above right'),
      pointAbstrait(4, 4, listeLettres[2][2], 'above right'),
      pointAbstrait(6, 4, listeLettres[2][3], 'above right'),
    ]
    this.reponses = [`$${E}$`, `$${H}$`, `$${D}$`]

    const points = tracePoint(...nuage)
    points.style = '.'
    points.epaisseur = 1.5
    const labels = labelPoint(...nuage)
    this.correction = `Si $${C}$ a pour image $${A}$ par $t_{\\overrightarrow{${C + A}}}$, alors $${J}$ a pour image $${miseEnEvidence(E)}$.`

    this.enonce = `Quelle est l'image du point $${J}$ par la translation qui transforme $${C}$ en $${A}$ ?<br>`
    this.enonce += mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 0.5 },
        fixeBordures([points, labels]),
      ),
      points,
      labels,
    )
  }

  versionOriginale: () => void = () => {
    const lettres = [
      ['F', 'E', 'L', 'K'],
      ['A', 'D', 'J', 'I'],
      ['B', 'C', 'G', 'H'],
    ]
    this.appliquerLesValeurs('C', 'A', 'J', 'E', 'H', 'D', lettres)
  }

  versionAleatoire: () => void = () => {
    const lettres = [
      ['F', 'E', 'L', 'K'],
      ['A', 'D', 'J', 'I'],
      ['B', 'C', 'G', 'H'],
    ]
    let A: string
    let C: string
    let E: string
    let H: string
    let D: string
    let J: string
    const n = 3
    const lettresBis: string[][] = shuffle(lettres)
    for (let i = 0; i < 3; i++) {
      lettresBis[i] = shuffle(lettresBis[i])
    }
    switch (randint(1, 4)) {
      case 1:
        C = lettresBis[2][1]
        A = lettresBis[1][0]
        J = lettresBis[1][2]
        E = lettresBis[0][1]
        H = lettresBis[2][3]
        D = lettresBis[1][1]
        break
      case 2:
        C = lettresBis[0][1]
        A = lettresBis[1][2]
        J = lettresBis[1][1]
        E = lettresBis[2][2]
        H = lettresBis[0][0]
        D = lettresBis[2][1]
        break
      case 3:
        C = lettresBis[0][3]
        A = lettresBis[1][2]
        J = lettresBis[1][1]
        E = lettresBis[2][0]
        H = lettresBis[0][2]
        D = lettresBis[1][0]
        break
      default:
        C = lettresBis[2][3]
        A = lettresBis[1][2]
        J = lettresBis[1][1]
        E = lettresBis[0][0]
        H = lettresBis[2][2]
        D = lettresBis[1][0]
    }
    do {
      this.appliquerLesValeurs(C, A, J, E, H, D, lettresBis)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
