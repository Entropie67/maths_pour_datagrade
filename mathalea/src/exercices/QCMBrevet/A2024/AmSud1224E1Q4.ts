import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { engrenages } from '../../../lib/2d/engrenage'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { latex2d } from '../../../lib/2d/textes'
import { aLeBonNombreDePropsDifferentes } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { sp } from '../../../lib/outils/outilString'
import { ppcm } from '../../../lib/outils/primalite'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'

import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = 'c6a37'
export const refs = {
  'fr-fr': ['3A1QCM-3'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'QCM Brevet Amérique du Sud 2024 : Arithmétique'
export const dateDePublication = '05/12/2024'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 * @author Jean-claude Lhote
 */
export default class AmeriqueSud1224Ex1Q4 extends ExerciceQcmA {
  private appliquerLesValeurs(nb1: number, nb2: number, nbTours: number): void {
    const engins = engrenages(
      { dureeTourBase: 0, module: 0.5, marqueurs: false },
      nb1,
      nb2,
    )
    for (const roue of engins) {
      roue.couleurDeRemplissage = colorToLatexOrHTML('gray')
      roue.marqueurD = null
      roue.marqueurG = null
    }
    const y0 = Math.min(engins[0].bordures[1], engins[1].bordures[1])
    const x1 = (engins[0].bordures[0] + engins[0].bordures[2]) / 2
    const x2 = (engins[1].bordures[0] + engins[1].bordures[2]) / 2
    const texte1 = latex2d(`${nb1}\\text{ dents}`, x1, y0 - 0.5, {})
    const texte2 = latex2d(`${nb2}\\text{ dents}`, x2, y0 - 0.5, {})
    const petiteRoue = nb1 < nb2 ? nb1 : nb2
    const grandeRoue = nb1 < nb2 ? nb2 : nb1
    const nbToursGrandeRoue = nbTours * (petiteRoue / grandeRoue)

    this.reponses = [
      `$${nbToursGrandeRoue}$ tours`,
      `$${nbTours}$ tours`,
      `$${nbToursGrandeRoue * 2}$ tours`,
    ]
    const figure = mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures([engins, texte1, texte2])),
      engins,
      texte1,
      texte2,
    )
    this.enonce = `Voici un engrenage${sp()}:<br>
    ${figure}${context.isHtml ? '' : '\n\n'}
    Si la petite roue effectue exactement $${nbTours}$ tours, combien de tours complets effectue la grande roue${sp()}?`
    this.correction = `La petite roue a $${petiteRoue}$ dents et la grande roue a $${grandeRoue}$ dents.<br>
 Soit $x$ le nombre de tours effectués par la grande roue.<br>
 Les produits des «${sp()}nombres de dents × nombre de tours${sp()}» sont égaux${sp()}: $${petiteRoue} \\times ${nbTours} = ${grandeRoue} \\times x$<br>
  On en déduit que $x =  \\dfrac{${nbTours} \\times${petiteRoue}}{${grandeRoue}} = ${nbToursGrandeRoue}$<br>
  La grande roue effectue donc $${nbToursGrandeRoue}$ tours pour $${nbTours}$ tours de la petite roue.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(12, 9, 4)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0

    do {
      const nb1 = choice([8, 10, 12, 14, 16, 18, 20])
      const nb2 = choice([8, 10, 12, 14, 16, 18, 20], [nb1, nb1 * 2, nb1 * 3])
      const petiteRoue = nb1 < nb2 ? nb1 : nb2
      const grandeRoue = nb1 < nb2 ? nb2 : nb1
      const produitNbDentsNbTours = ppcm(petiteRoue, grandeRoue)
      const nbTours = produitNbDentsNbTours / petiteRoue
      this.appliquerLesValeurs(nb1, nb2, nbTours)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 3, true))
  }

  constructor() {
    super()
    this.optionsDeComparaison = { texteSansCasse: true }
    this.versionAleatoire()
  }
}
