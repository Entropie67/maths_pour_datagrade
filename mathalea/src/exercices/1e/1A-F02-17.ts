import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { droite } from '../../lib/2d/droites'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { context } from '../../modules/context'

import { bleuMathalea } from '../../lib/colors'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
/**
 * @author Gilles Mora
 *
 */
export const uuid = '08fc7'
export const refs = {
  'fr-fr': ['1A-F02-17'],
  'fr-ch': ['1mQCM-43', '11CTQCMFA2-6', '11LCQCMFA2A-6', '11LSQCMFA2A-8'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Déterminer la position relative d'un point par rapport à une droite"
export const dateDePublication = '17/12/2025'

export default class Auto1AF2q extends ExerciceQcmA {
  private appliquerLesValeurs(
    numCoeff: number,
    denCoeff: number,
    ordOrigine: number,
    multiplicateur: number,
    position: number,
  ): void {
    const coeffDir = new FractionEtendue(numCoeff, denCoeff)
    const abs = multiplicateur * denCoeff
    const ordSurDroite = numCoeff * multiplicateur + ordOrigine

    let ord: number
    if (position === 0) {
      // Sur la droite
      ord = ordSurDroite
    } else if (position === 1) {
      // Au-dessus de la droite
      ord = ordSurDroite + randint(1, 3)
    } else {
      // En dessous de la droite
      ord = ordSurDroite - randint(1, 3)
    }

    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })
    const A = pointAbstrait(0, ordOrigine)
    const B = pointAbstrait(denCoeff, ordOrigine + numCoeff)

    const traceA = tracePoint(A, 'black')
    traceA.taille = 3
    traceA.epaisseur = 2

    const traceB = tracePoint(B, 'black')
    traceB.taille = 3
    traceB.epaisseur = 2

    const d = droite(A, B, '', bleuMathalea)
    d.epaisseur = 2

    const xmin = -4
    const ymin = -2
    const xmax = 8
    const ymax = 6

    const r1 = repere({
      xMin: xmin,
      xMax: xmax,
      xUnite: 1,
      yMin: ymin,
      yMax: ymax,
      yUnite: 1,
      thickHauteur: 0.1,
      xLabelMin: xmin + 1,
      xLabelMax: xmax - 1,
      yLabelMax: ymax - 1,
      yLabelMin: ymin + 1,
      axeXStyle: '->',
      axeYStyle: '->',
      axesEpaisseur: 2,
      yLabelDistance: 1,
      yLabelEcart: 0.3,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireOpacite: 0.2,
      grilleSecondaireYMin: ymin,
      grilleSecondaireYMax: ymax + 0.05,
      grilleSecondaireXMin: xmin + 0.05,
      grilleSecondaireXMax: xmax + 0.05,
    })

    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin: ymin - 0.25,
        ymax: ymax + 0.25,
        pixelsParCm: 30,
        scale: 0.75,
        center: !context.isHtml,
      },
      d,
      r1,
      o,
      traceA,
      traceB,
    )

    this.enonce = `${deuxColonnes(
      `Dans un repère du plan, on a représenté une droite $(D)$.<br><br>
      On considère le point $A$ de coordonnées $(${abs}\\,;\\,${ord})$.<br><br>
      ${this.interactif ? 'La position du point $A$ par rapport à la droite $(D)$ est donnée par l’affirmation suivante :' : 'Quelle est la position du point $A$ par rapport à la droite $(D)$ ?'}`,
      `${objet}`,
    )}<br>`

    // Correction détaillée
    this.correction = `On commence par déterminer l'équation réduite de la droite $(D)$.<br>
    Son coefficient directeur est $${coeffDir.texFractionSimplifiee}$ et son ordonnée à l'origine est $${ordOrigine}$.<br>
    L'équation réduite de $(D)$ est : $y=${coeffDir.texFractionSimplifiee}x+${ordOrigine}$.<br>
    L'ordonnée du point de $(D)$ d'abscisse $${abs}$ est donnée par : $y=${coeffDir.texFractionSimplifiee}\\times ${abs < 0 ? `(${abs})` : abs}+${ordOrigine}$, ce qui donne<br>
    $y=\\dfrac{${numCoeff * abs}}{${denCoeff}}+${ordOrigine}=${(numCoeff * abs) / denCoeff}+${ordOrigine}=${texNombre(ordSurDroite)}$.<br>
    L'ordonnée du point de $(D)$ d'abscisse $${abs}$ est $${ordSurDroite}$.<br>`

    if (position === 0) {
      this.correction += `L'ordonnée du point de $(D)$ d'abscisse $${abs}$ est égale à l'ordonnée de $A$, donc ${texteEnCouleurEtGras(`le point $${miseEnEvidence('A')}$ appartient à la droite $${miseEnEvidence('(D)')}$`)}.`
      this.reponses = [
        `Le point $A$ appartient à la droite $(D)$`,
        `Le point $A$ est situé au-dessus de la droite $(D)$`,
        `Le point $A$ est situé en dessous de la droite $(D)$`,
        `On ne peut pas déterminer la position de $A$ par rapport à la droite $(D)$`,
      ]
    } else if (position === 1) {
      this.correction += `On a $${ord}>${ordSurDroite}$, donc ${texteEnCouleurEtGras(`le point $${miseEnEvidence('A')}$ est situé au-dessus de la droite $${miseEnEvidence('(D)')}$`)}.`
      this.reponses = [
        `Le point $A$ est situé au-dessus de la droite $(D)$`,
        `Le point $A$ appartient à la droite $(D)$`,
        `Le point $A$ est situé en dessous de la droite $(D)$`,
        `On ne peut pas déterminer la position de $A$ par rapport à la droite $(D)$`,
      ]
    } else {
      this.correction += `On a $${ord}<${ordSurDroite}$, donc ${texteEnCouleurEtGras(`le point $${miseEnEvidence('A')}$ est situé en dessous de la droite $${miseEnEvidence('(D)')}$`)}.`
      this.reponses = [
        `Le point $A$ est situé en dessous de la droite $(D)$`,
        `Le point $A$ appartient à la droite $(D)$`,
        `Le point $A$ est situé au-dessus de la droite $(D)$`,
        `On ne peut pas déterminer la position de $A$ par rapport à la droite $(D)$`,
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(1, 3, 2, 12, 1)
  }

  versionAleatoire: () => void = () => {
    const listeFractions = [
      [1, 2],
      [1, 4],
      [-1, 4],
      [1, 3],
      [1, 4],
      [1, 5],
      [2, 3],
      [2, 5],
      [-1, 2],
      [-1, 3],
      [-2, 3],
      [-1, 5],
      [-2, 5],
      [-1, 6],
      [1, 6],
    ]
    const frac = choice(listeFractions)
    const ordOrigine = randint(1, 3)
    const position = randint(0, 2)
    const multiplicateur = randint(10, 19) * choice([-1, 1])

    this.appliquerLesValeurs(
      frac[0],
      frac[1],
      ordOrigine,
      multiplicateur,
      position,
    )
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
