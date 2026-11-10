import { choice } from '../../../lib/outils/arrayOutils'
import { fraction } from '../../../modules/fractions'
import { nombreEnLettres } from '../../../modules/nombreEnLettres'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'be990'
export const refs = {
  'fr-fr': ['3S2QCM-6', 'BP2FLUC7', 'BP1AUTO007'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'QCM Brevet Amérique du Sud 2024 : probabilités'
export const dateDePublication = '05/12/2024'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 * @author Jean-claude Lhote
 */
export default class AmeriqueSud1224Ex1Q1 extends ExerciceQcmA {
  private appliquerLesValeurs(
    nb1: number,
    nb2: number,
    couleur1: string,
    couleur2: string,
  ): void {
    this.reponses = [
      `$\\dfrac{${nb2}}{${nb1 + nb2}}$`,
      `$\\dfrac{${nb1}}{${nb1 + nb2}}$`,
      `$\\dfrac{${nb2}}{${nb1}}$`,
    ]
    const frac = fraction(nb2, nb1 + nb2)
    this.enonce = `Une urne contient ${nombreEnLettres(nb1)} jeton${nb1 > 1 ? 's' : ''} ${couleur1}${nb1 > 1 ? 's' : ''} et ${nombreEnLettres(nb2)} jeton${nb2 > 1 ? 's' : ''} ${couleur2}${nb2 > 1 ? 's' : ''}. On tire un jeton au hasard.<br>
    Quelle est la probabilité d'obtenir un jeton ${couleur2}${sp()}?`
    this.correction = `Il y a en tout ${nombreEnLettres(nb1 + nb2)} jetons. Il y a ${nombreEnLettres(nb2)} jeton${nb2 > 1 ? 's' : ''} ${couleur2}${nb2 > 1 ? 's' : ''}. La probabilité d'obtenir un jeton ${couleur2} est donc de $\\dfrac{${nb2}}{${nb1 + nb2}}$`
    this.correction += frac.estIrreductible
      ? '.'
      : `, ou $${frac.texFractionSimplifiee}$ en simplifiant.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, 2, 'vert', 'blanc')
  }

  versionAleatoire: () => void = () => {
    const nbReponses = 1
    do {
      const couleurs = ['vert', 'blanc', 'rouge', 'bleu', 'jaune', 'noir']
      const couleur1 = choice(couleurs)
      const couleur2 = choice(couleurs, [couleur1])
      const nb1 = randint(1, 10)
      const nb2 = randint(1, 10, [nb1])

      this.appliquerLesValeurs(nb1, nb2, couleur1, couleur2)
    } while (nombreElementsDifferents(this.reponses) < nbReponses)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
