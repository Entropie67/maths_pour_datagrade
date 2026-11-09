// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid fef8a continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'fef8a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Amérique 05/22 : fonction'
export const dateDePublication = '09/03/2025'
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
      "La droite d'équation $y = -\\dfrac{1}{2} \\mathrm{e}$ est tangente à la courbe $\\mathcal{C}_f$ au point d'abscisse $\\sqrt{\\mathrm{e}}$.", // Réponse correcte (d)
      "Pour tout réel $x$ de l'intervalle $]0~;~+ \\infty[$, $f'(x) = 2x + \\dfrac{1}{x}$.", // Mauvaise réponse (a)
      "La fonction $f$ est croissante sur l'intervalle $]0~;~+ \\infty[$.", // Mauvaise réponse (b)
      "$f'\\left(\\sqrt{\\mathrm{e}} \\right)$ est différent de $0$.", // Mauvaise réponse (c)
    ]

    this.enonce =
      `La fonction $f$ est définie sur l'intervalle $]0~;~+ \\infty[$ par l'expression${sp()}:<br>`
    this.enonce += '$f(x) = x^2(-1 + \\ln x).$<br>'
    this.enonce +=
      "On note $\\mathcal{C}_f$ sa courbe représentative dans le plan muni d'un repère.<br>"
    this.enonce += `Parmi les affirmations suivantes, laquelle est correcte${sp()}?`

    this.correction =
      'La fonction $f$ est continue et dérivable sur $]0~;~+ \\infty[$.<br>'
    this.correction += `On calcule sa dérivée${sp()}:<br>`
    this.correction +=
      "$f'(x) = 2x(-1 + \\ln x) + x^2 \\times \\dfrac{1}{x} = -2x + 2x \\ln x + x = x(2 \\ln x - 1).$<br>"
    this.correction += `On résout $f'(x) = 0$${sp()}:<br>`
    this.correction +=
      '$x(2 \\ln x - 1) = 0 \\iff 2 \\ln x - 1 = 0 \\iff \\ln x = \\dfrac{1}{2} \\iff x = \\sqrt{\\mathrm{e}}.$<br>'
    this.correction +=
      `La tangente au point d'abscisse $a = \\sqrt{\\mathrm{e}}$ est horizontale. Son équation est donnée par${sp()}:<br>`
    this.correction += "$y = f'(a)(x - a) + f(a).$<br>"
    this.correction +=
      `On a $f'\\left(\\sqrt{\\mathrm{e}}\\right) = 0$ et${sp()}:<br>`
    this.correction +=
      '$f\\left(\\sqrt{\\mathrm{e}}\\right) = \\left(\\sqrt{\\mathrm{e}}\\right)^2 \\left(-1 + \\ln \\left(\\sqrt{\\mathrm{e}}\\right)\\right) = \\mathrm{e} \\left(-1 + \\dfrac{1}{2}\\right) = -\\dfrac{1}{2} \\mathrm{e}.$<br>'
    this.correction += `L'équation de la tangente est donc${sp()}:`
    this.correction += `$${miseEnEvidence('y = -\\dfrac{1}{2} \\mathrm{e}.')}$<br>`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
