// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 2f131 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '2f131'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Nouvelle Calédonie 08/23 : produit scalaire'
export const dateDePublication = '05/11/2024'
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
      '$\\alpha \\approx 71^{\\circ}$',
      '$\\alpha = 90^{\\circ}$',
      '$\\alpha > 90^{\\circ}$',
      '$\\alpha = 0^{\\circ}$',
    ]

    this.enonce =
      "On se place dans l'espace muni d'un repère orthonormé $\\left(O;\\vec{\\imath};\\vec{\\jmath};\\vec{k}\\right).$<br>"
    this.enonce +=
      'On considère les points $E(1~;~2~;~1)$, $F(2~;~4~;~3)$ et $G(-2~;~ 2~;~5)$.<br>'

    this.enonce +=
      `On peut affirmer que la mesure $\\alpha$ de l'angle $\\widehat{\\text{FEG}}$ vérifie${sp()}:<br>`

    this.correction =
      'On sait que $\\overrightarrow{\\mathrm{EF}} \\cdot \\overrightarrow{\\mathrm{EG}}=\\|\\overrightarrow{\\mathrm{EF}}\\| \\times\\|\\overrightarrow{\\mathrm{EG}}\\| \\times \\cos (\\overrightarrow{\\mathrm{EF}}, \\overrightarrow{\\mathrm{EG}}) \\Longleftrightarrow \\cos \\alpha=\\dfrac{\\overrightarrow{\\mathrm{EF}} \\cdot \\overrightarrow{\\mathrm{EG}}}{\\|\\overrightarrow{\\mathrm{EF}}\\| \\times\\|\\overrightarrow{\\mathrm{EG}}\\|}$<br>'
    this.correction +=
      ' On a $: \\overrightarrow{\\mathrm{EF}}\\left(\\begin{array}{l}2-1 \\\\ 4-2 \\\\ 3-1\\end{array}\\right)=\\left(\\begin{array}{l}1 \\\\ 2 \\\\ 2\\end{array}\\right)$ et $\\overrightarrow{\\mathrm{EG}}\\left(\\begin{array}{c}-2-1 \\\\ 2-2 \\\\ 5-1\\end{array}\\right)=\\left(\\begin{array}{c}-3 \\\\ 0 \\\\ 4\\end{array}\\right) .$<br>'
    this.correction +=
      '$\\overrightarrow{\\mathrm{EF}} \\cdot \\overrightarrow{\\mathrm{EG}}=1 \\times(-3)+2 \\times 0+2 \\times 4=5$<br>'
    this.correction +=
      '$\\|\\overrightarrow{\\mathrm{EF}}\\|=\\sqrt{1^2+2^2+2^2}=\\sqrt{9}=3$<br>'
    this.correction +=
      '$\\|\\overrightarrow{\\mathrm{EG}}\\|=\\sqrt{(-3)^2+0^2+4^2}=\\sqrt{25}=5$<br>'
    this.correction +=
      `Donc${sp()}: $\\cos \\alpha=\\dfrac{5}{3 \\times 5}=\\dfrac{1}{3}$, soit $\\alpha \\approx 71^{\\circ}$ d'après la calculatrice.<br>`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
