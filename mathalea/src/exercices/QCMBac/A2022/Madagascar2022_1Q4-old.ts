// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid bd6d4 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'bd6d4'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Madagascar 05/22 : équation'
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
      'exactement $1$ fois.',
      'exactement $0$ fois. ',
      'exactement $2$ fois.',
      'exactement $3$ fois.',
    ]

    this.enonce =
      `On considère la fonction $h$ définie sur l'intervalle $]0~;~2]$ par${sp()}: $h(x) = x^2(1 + 2\\ln (x)).$<br>`
    this.enonce +=
      'On note $\\mathcal{C}_h$ la courbe représentative de $h$ dans un repère du plan. <br>'
    this.enonce +=
      `Sur l'intervalle $\\left]\\dfrac{1}{\\mathrm{e}}~;~2\\right]$, la fonction $h$ s'annule${sp()}:<br>`
    this.correction =
      'On a  :<br> $\\begin{aligned}&h(x) = 0\\\\ \\iff &x^2(1 + 2\\ln (x)) = 0\\end{aligned}$'
    this.correction +=
      ' <br>$\\begin{aligned}\\iff& \\begin{cases}x^2 =0\\\\1 + 2\\ln (x)=0\\end{cases} \\end{aligned}$'
    this.correction +=
      ' <br>$\\begin{aligned}\\iff& \\begin{cases}x =0\\\\1 + 2\\ln (x)=0\\end{cases} \\end{aligned}$'
    this.correction +=
      ' <br>$\\begin{aligned}\\iff& \\begin{cases}x =0\\\\2\\ln (x)=- 1\\end{cases} \\end{aligned}$'
    this.correction +=
      ' <br>$\\begin{aligned}\\iff& \\begin{cases}x =0\\\\\\ln (x)=- \\dfrac{1}{2}\\end{cases} \\end{aligned}$'
    this.correction +=
      ' <br>$\\begin{aligned}\\iff& \\begin{cases}x =0\\\\x=\\mathrm{e}^{- \\dfrac{1}{2}}\\end{cases} \\end{aligned}$'

    this.correction +=
      "<br>Comme $0$ ne peut être solution et que $\\mathrm{e}^{- \\frac{1}{2}} \\in ]0~;~2]$, l'équation a une solution."
    this.correction += `<br>Elle s'annule ${texteEnCouleurEtGras('exactement $\\mathbf{1}$ fois.')}`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
