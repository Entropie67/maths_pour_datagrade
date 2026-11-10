// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid a2828 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'a2828'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Madagascar 05/22 : tangente'
export const dateDePublication = '07/03/2025'
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
      '$y = \\left(6\\mathrm{e}^{\\frac12}\\right)  x - 4\\mathrm{e}$', // Réponse correcte (d)
      '$y = \\left(6\\mathrm{e}^{\\frac12}\\right) x$', // Mauvaise réponse (a)
      '$y = \\left(6\\sqrt{\\mathrm{e}}\\right) x + 2\\mathrm{e}$', // Mauvaise réponse (b)
      '$y = 6\\mathrm{e}^{\\frac{x}{2}}$', // Mauvaise réponse (c)
    ]

    this.enonce =
      `On considère la fonction $h$ définie sur l'intervalle $]0~;~2]$ par${sp()}:    $h(x) = x^2(1 + 2\\ln (x))$.<br>`
    this.enonce +=
      "On admet que $h$ est dérivable sur l'intervalle $]0~;~2]$.<br>"
    this.enonce +=
      `On note $h'$ sa dérivée et on admet que, pour tout réel $x$ de l'intervalle $]0~;~2]$, on a${sp()}: $h'(x) = 4x(1 + \\ln (x))$. <br>`
    this.enonce +=
      'On note $\\mathcal{C}_h$ la courbe représentative de $h$ dans un repère du plan.<br>'
    this.enonce +=
      `Une équation de la tangente à $\\mathcal{C}_h$ au point d'abscisse $\\sqrt{\\mathrm{e}}$ est${sp()}:<br>`
    this.correction =
      "Une équation de la tangente est $y=h'\\left(\\sqrt{\\mathrm{e}}\\right) \\left(x - \\sqrt{\\mathrm{e}}\\right)+h\\left(\\sqrt{\\mathrm{e}}\\right)$.<br>"
    this.correction +=
      "$\\bullet~~$ On calcule $h'\\left(\\sqrt{\\mathrm{e}}\\right) = 4 \\times \\sqrt{\\mathrm{e}}\\left(1 + \\ln \\left(\\sqrt{\\mathrm{e}}\\right)\\right) = 4 \\times \\sqrt{\\mathrm{e}} \\times \\left(1 + \\dfrac12\\right) = 6\\sqrt{\\mathrm{e}}$.<br>"
    this.correction +=
      '$\\bullet~~$ On calcule $h\\left(\\sqrt{\\mathrm{e}}\\right) = \\left(\\sqrt{\\mathrm{e}}\\right)^2\\left(1 + 2 \\ln \\left(\\sqrt{\\mathrm{e}}\\right)\\right) = \\mathrm{e} \\times (1 + 1) = 2\\mathrm{e}$.<br>'
    this.correction += `L'équation de la tangente s'écrit donc${sp()}:<br>`
    this.correction +=
      '$\\begin{aligned}    y  &= 6\\sqrt{\\mathrm{e}}\\left(x - \\sqrt{\\mathrm{e}}\\right)+ 2\\mathrm{e}  \\\\    \\iff y &= 6x\\sqrt{\\mathrm{e}} - 4\\mathrm{e} \\end{aligned}$<br>'
    this.correction += `L'équation de la tangente est donc${sp()}: $${miseEnEvidence('y = \\left(6\\mathrm{e}^{\\frac12}\\right)  x - 4\\mathrm{e}')}$`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
