// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid d09fe continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'd09fe'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Nouvelle Calédonie 08/23 : primitive'
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
      '$F(x) = 1+x\\mathrm{e}^x$',
      '$F(x) = (1+x)\\mathrm{e}^x$',
      '$F(x) = (2 + x)\\mathrm{e}^x$',
      '$F(x) = \\left(\\dfrac{x^2}{2}  + x\\right)\\mathrm{e}^x$',
    ]

    this.enonce = ` On considère la fonction $f$ définie sur $\\mathbb R$ par${sp()}: $f(x) = (x + 1)\\mathrm{e}^x$. <br>
    Une primitive $F$ de $f$ sur $\\mathbb R$ est définie par${sp()}:`
    this.correction = 'Si on dérive $F(x) = 1+x\\mathrm{e}^x$,<br>'
    this.correction +=
      `on obtient${sp()}: $F^{\\prime}(x) = 1 \\times \\mathrm{e}^x + x\\mathrm{e}^x= (1+x)\\mathrm{e}^x$.<br>`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
