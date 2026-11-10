// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 4f818 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '4f818'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Centres étrangers 05/22 : primitive'
export const dateDePublication = '24/02/2025'
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
      '$g(x) = - \\dfrac12 \\ln \\left(1 - x^2\\right)$',
      '$g(x) =  \\dfrac{1 + x^2}{ \\left(1 - x^2\\right)^2}$',
      '$g(x)= \\dfrac{x^2}{2\\left(x - \\dfrac{x^3}{3}\\right)}$',
      '$g(x) = \\dfrac{x^2}{2}\\ln \\left(1 - x^2\\right)$',
    ]

    this.enonce = ` On considère la fonction $f$ définie sur $]- 1~;~1[$ par $f(x) = \\dfrac{x}{1 - x^2}.$
<br>Une primitive de la fonction $f$ est la fonction $g$ définie sur l'intervalle $] - 1~;~1[$ par${sp()}:`
    this.correction =
      'Soit la fonction $g$ définie sur $] - 1~;~1[$ par $g(x) = - \\dfrac12 \\ln \\left(1 - x^2\\right)$.<br>'
    this.correction +=
      "En posant $u(x) = 1 - x^2$, dérivable et non nulle sur $] - 1~;~1[$, on a $u'(x) = - 2x$."
    this.correction +=
      "<br>On sait que $g(x) = - \\dfrac12\\ln u(x)$ entraîne $g'(x) = - \\dfrac12\\dfrac{u'(x)}{u(x)} = - \\dfrac12 \\times \\dfrac{- 2x}{1 - x^2} = \\dfrac{x}{1 - x^2} = f(x)$."
    this.correction += `<br>${texteEnCouleurEtGras('La fonction $g$ est donc une primitive de la fonction $f$ sur $] - 1~;~1[$.')}`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
