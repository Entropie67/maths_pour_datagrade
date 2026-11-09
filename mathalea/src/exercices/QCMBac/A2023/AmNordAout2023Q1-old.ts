// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid bd8e1 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'bd8e1'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Amérique 08/23 : limite'
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
    this.reponses = ['$0,05$', '$+\\infty$', '$-\\infty$', '$0$']

    this.enonce = ` On considère la fonction $f$ définie sur l'intervalle $]1~;~+\\infty[$ par 
$f(x)= 0,05 - \\dfrac{\\ln x}{x - 1}.$<br>

La limite de la fonction $f$ en $+\\infty$ est égale à${sp()}:`
    this.correction =
      '$f(x)= 0,05 - \\dfrac{\\ln x}{x - 1}= 0,05 - \\dfrac{\\ln x}{x}\\times \\dfrac{x}{x-1}$<br>'
    this.correction +=
      'Or $\\displaystyle\\lim_{x\\to +\\infty} \\dfrac{\\ln x}{x}=0$<br>'
    this.correction +=
      'et $\\displaystyle\\lim_{x\\to +\\infty}  \\dfrac{x}{x-1}=1$<br>'
    this.correction +=
      'donc $\\displaystyle\\lim_{x\\to +\\infty} \\dfrac{\\ln x}{x}\\times \\dfrac{x}{x-1}=0$.<br>'
    this.correction +=
      'On en déduit que $\\displaystyle\\lim_{x\\to +\\infty}f(x)=0,05$'
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
