// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid e37a9 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'e37a9'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Centres étrangers 05/22 : concavité'
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
      "La courbe $\\mathcal{C}_g$ admet exactement un point d'inflexion sur $]0~;~+\\infty[$.",
      'La fonction $g$ est convexe sur $]0~;~+\\infty[$.',
      'La fonction $g$ est concave sur $]0~;~+\\infty[$.',
      "La courbe $\\mathcal{C}_g$ admet exactement deux points d'inflexion sur $]0~;~+\\infty[$.",
    ]

    this.enonce = ` Soit la fonction $g$ définie pour tout réel $x$ strictement positif par${sp()}: <br>
$g(x) = x \\ln (x) - x^2$.<br>
On note $\\mathcal{C}_g$ sa courbe représentative dans un repère du plan.`
    this.correction =
      `Sur $]0~;~+\\infty[$, $g$ est dérivable et sur cet intervalle${sp()}:<br> $f'(x) = \\ln (x) + x \\times \\dfrac{1}{x} - 2x = \\ln (x) - 2x + 1$.`
    this.correction += "<br> Puis $f''(x) = \\dfrac{1}{x} - 2$."
    this.correction +=
      "<br>On a donc $f''(x) = 0 \\iff \\dfrac{1}{x} - 2 = 0 \\iff \\dfrac{1}{x} = 2 \\iff x = \\dfrac{1}{2}$."
    this.correction += `<br>Sur $]0~;~+ \\infty[$,   ${texteEnCouleurEtGras("$f$ admet un seul point d'inflexion d'abscisse $\\dfrac{1}{2}$.")}`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
