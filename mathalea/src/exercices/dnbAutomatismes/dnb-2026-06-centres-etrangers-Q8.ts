import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'cea08'
export const refs = {
  'fr-fr': ['3AutoP03-2'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Choisir le calcul correspondant à une baisse en pourcentage'
export const dateDePublication = '11/08/2026'

/**
 * DNB Centres étrangers juin 2026 - Question 8
 * @author Jean-Claude Lhote
 */
export default class AutoQ8CentresEtrangersBrevet2026 extends ExerciceQcmA {
  private appliquerLesValeurs(prix: number, pourcentage: number): void {
    this.enonce = `Un article coûte $${prix}$ €. Son prix baisse de $${pourcentage}\\,\\%$. Recopier le calcul permettant de trouver le prix final de l'article.`
    this.reponses = [
      `$${prix}-\\dfrac{${pourcentage}}{100}\\times ${prix}$`,
      `$${prix}-${pourcentage}$`,
      `$${prix}-\\dfrac{${pourcentage}}{100}$`,
      `$\\left(${prix}-\\dfrac{${pourcentage}}{100}\\right)\\times ${prix}$`,
    ]
    this.correction = `Une baisse de $${pourcentage}\\,\\%$ correspond à une diminution de $\\dfrac{${pourcentage}}{100}$ du prix initial.<br>
Le calcul du prix final est donc $${prix}-\\dfrac{${pourcentage}}{100}\\times ${prix}$.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(80, 10)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    this.appliquerLesValeurs(randint(5, 12) * 10, randint(1, 4) * 5)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
