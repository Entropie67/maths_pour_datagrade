// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid bdd72 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'bdd72'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 05/22 : variations'
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
      'Toutes les primitives sont croissantes sur $\\R$', // Réponse correcte (a)
      'Toutes les primitives sont décroissantes sur $\\R$', // Mauvaise réponse (b)
      "Certaines sont croissantes et d'autres décroissantes sur $\\R$", // Mauvaise réponse (c)
      'Toutes sont croissantes sur $]-\\infty~;~0]$ et décroissantes sur $[0~;~+\\infty[$', // Mauvaise réponse (d)
    ]

    this.enonce =
      'Parmi les primitives de la fonction $f$ définie sur $\\R$ par  '
    this.enonce += '$f(x) = 3\\mathrm{e}^{-x^2} + 2,$<br>'
    this.enonce += `laquelle des affirmations suivantes est correcte${sp()}?`

    this.correction =
      'La fonction $f$ est continue et strictement positive sur $\\R$ car $\\mathrm{e}^{-x^2} > 0$.<br>'
    this.correction +=
      'Ainsi, toutes les primitives de $f$ ont pour dérivée $f$, qui est positive.<br>'
    this.correction +=
      'Cela signifie que toutes les primitives de $f$ sont croissantes sur $\\R$.<br>'
    this.correction += `La bonne réponse est donc${sp()}: ${texteEnCouleurEtGras('Toutes les primitives sont croissantes sur $\\mathbb R$')}.`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
