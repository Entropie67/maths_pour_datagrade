// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid dc224 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'dc224'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Nouvelle Calédonie 08/23 : plans'
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
      'sécants et non perpendiculaires.',
      'sécants et perpendiculaires.',
      'confondus.',
      'strictement parallèles.',
    ]

    this.enonce =
      "On se place dans l'espace muni d'un repère orthonormé $\\left(O;\\vec{\\imath};\\vec{\\jmath};\\vec{k}\\right).$<br>"
    this.enonce +=
      'On considère le plan $\\left(P_1\\right)$ dont une équation cartésienne est $x - 2y + z + 1 = 0$,<br>'
    this.enonce +=
      ' ainsi que le plan $\\left(P_2\\right)$ dont une équation cartésienne est $2x + y + z - 6 = 0$.<br>'
    this.enonce +=
      `Les plans $\\left(P_1\\right)$ et $\\left(P_2\\right)$ sont${sp()}:<br>`

    this.correction =
      'Un vecteur normal à $\\left(\\mathrm{P}_1\\right)$ est $\\overrightarrow{n_1}=\\left(\\begin{array}{c}1 \\\\ -2 \\\\ 1\\end{array}\\right)$ <br>'
    this.correction +=
      'et un vecteur normal à $\\left(\\mathrm{P}_2\\right)$ est $\\overrightarrow{n_2}=\\left(\\begin{array}{l}2 \\\\ 1 \\\\ 1\\end{array}\\right)$. <br>'
    this.correction +=
      'On a $\\dfrac{1}{2} \\neq \\frac{-2}{1}$, donc $\\overrightarrow{n_1}$ et $\\overrightarrow{n_2}$ ne sont pas colinéaires. Les plans ne sont donc pas parallèles. Ils sont donc sécants.<br>'
    this.correction +=
      'De plus $\\overrightarrow{n_1} \\cdot \\overrightarrow{n_2}=1 \\times 2-2 \\times 1+1 \\times 1=1$, donc les vecteurs $\\vec{n}_1$ et $\\vec{n}_2$ ne sont pas orthogonaux. Les plans ne sont donc pas perpendiculaires.<br>'
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
