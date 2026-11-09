// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid d873d continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'd873d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Centres étrangers 05/22 : tangente'
export const dateDePublication = '25/02/2025'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 */
/**
 *
 * @author Stéphane Guyon
 *
 */
export default class SujetZero2024Ex5Q5Old extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      '$y = 4x- 7$ ',
      '$y = 2x - 4$',
      '$y = -3(x - 1) + 4$',
      '$y = 2x - 1$',
    ]

    this.enonce =
      ' On considère la fonction $f$ définie sur $]0,5~;~+ \\infty [$ par $f(x) =x^2- 4x+ 3 \\ln (2x - 1)$.'
    this.enonce +=
      `<br>Une équation de la tangente à la courbe représentative de $f$ au point d'abscisse $1$ est${sp()}:`
    this.correction =
      `Une équation de la tangente au point d'abscisse $1$ est${sp()}: $y - f(1) = f'(1)(x - 1)$.`
    this.correction +=
      '<br>$\\bullet~~f(1) = 1 - 4 + 3\\ln (2 - 1) = - 3 + 3 \\times 0 = - 3$ '
    this.correction +=
      "<br>$\\bullet~~f'(x) = 2x - 4 + 3 \\times \\dfrac{2}{2x - 1} = 2x - 4 + \\dfrac{6}{2x - 1}$,"
    this.correction += "<br>d'où $f'(1) = 2 - 4 + \\dfrac{6}{1} = - 2 + 6 = 4$."
    this.correction += `<br>Une équation de la tangente est donc $y - (- 3) = 4(x - 1) \\iff y = 4x - 4 - 3\\iff ${miseEnEvidence('y = 4x - 7')}$ .`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
