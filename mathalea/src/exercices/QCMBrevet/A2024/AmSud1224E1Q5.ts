import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { grille } from '../../../lib/2d/Grille'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../../lib/2d/textes'
import { homothetie } from '../../../lib/2d/transformations'
import { choisitLettresDifferentes } from '../../../lib/outils/aleatoires'
import { choice } from '../../../lib/outils/arrayOutils'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'c6f47'
export const refs = {
  'fr-fr': ['3G1QCM-4'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'QCM Brevet Amérique du Sud 2024 : Homothétie'
export const dateDePublication = '05/12/2024'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 * @author Jean-claude Lhote
 */
export default class AmeriqueSud1224Ex1Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(
    noms: string,
    rapport: number,
    sensDirect: boolean,
    step: number,
    choix: boolean,
  ): void {
    const coef = sensDirect ? 1 : -1
    const A = pointAbstrait(
      0,
      0,
      noms[0],
      coef > 0 ? 'above left' : 'below right',
    )
    const G = pointAbstrait(
      rapport * coef,
      0,
      noms[1],
      coef > 0 ? 'above left' : 'below right',
    )
    const F = pointAbstrait(
      rapport * coef,
      rapport * coef,
      noms[2],
      coef > 0 ? 'below left' : 'above right',
    )
    const E = pointAbstrait(
      0,
      rapport * coef,
      noms[3],
      coef > 0 ? 'below right' : 'above left',
    )
    const D = homothetie(
      G,
      A,
      1 / rapport,
      noms[4],
      coef < 0 ? 'above left' : 'below right',
    )
    const C = homothetie(
      F,
      A,
      1 / rapport,
      noms[5],
      coef < 0 ? 'below left' : 'above right',
    )
    const B = homothetie(
      E,
      A,
      1 / rapport,
      noms[6],
      coef < 0 ? 'below right' : 'above left',
    )
    const poly1 = polygone(A, G, F, E)
    const poly2 = polygone(A, D, C, B)
    const segGE = segment(G, E)
    const segBD = segment(B, D)
    const xmin = Math.min(rapport * coef, -rapport * coef) - 1
    const xmax = Math.max(rapport * coef, -rapport * coef) + 1
    const labels = labelPoint(A, B, C, D, E, F, G)

    const g = grille(xmin, xmin, xmax, xmax, 'gray', 0.7, step)
    const objets = [g, poly1, poly2, segGE, segBD, labels]
    const figure = mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures([objets])),
      objets,
    )

    this.reponses = [
      `$${noms[6]}${noms[4]}${noms[5]}$`,
      `$${noms[0]}${noms[6]}${noms[4]}$`,
      `$${noms[1]}${noms[3]}${choix ? noms[0] : noms[2]}$`,
    ]
    this.enonce = `${figure}${context.isHtml ? '' : '\n\n'}
    Le carré $${noms.substring(0, 4)}$ est l'image du carré $${noms[0]}${noms.substring(4)}$  par une homothétie de centre $${noms[0]}$.<br>
    Le triangle $${noms[3]}${noms[1]}${choix ? noms[2] : noms[0]}$ est l'image d'un triangle par cette homothétie.<br>
    Quel est le nom de ce triangle${sp()}?`
    this.correction = `Par cette homothétie, le point $${noms[1]}$ est l'image de $${noms[4]}$, le point $${noms[3]}$ est l'image de $${noms[6]}$ et le point $${choix ? noms[2] : noms[0]}$ est l'image de $${choix ? noms[5] : noms[0]}$.<br>
    Le triangle $${noms[3]}${noms[1]}${choix ? noms[2] : noms[0]}$ est donc l'image du triangle $${noms[6]}${noms[4]}${choix ? noms[5] : noms[0]}$ par cette homothétie.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs('AGFEDCB', -2, true, 1, true)
  }

  versionAleatoire: () => void = () => {
    const nbReponses = 1

    do {
      const noms = choisitLettresDifferentes(7).join('')
      const rapport = choice([-3, -2])
      this.appliquerLesValeurs(
        noms,
        rapport,
        choice([true, false]),
        0.5,
        choice([true, false]),
      )
    } while (nombreElementsDifferents(this.reponses) < nbReponses)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
