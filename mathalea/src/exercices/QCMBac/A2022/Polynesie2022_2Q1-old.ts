// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 9fd0c continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '9fd0c'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Polynésie 05/22 : dérivée'
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
      '$ \\ln(x) $', // Réponse correcte (a)
      '$ \\dfrac{1}{x} - 1 $', // Mauvaise réponse (b)
      '$ \\ln(x) - 2 $', // Mauvaise réponse (c)
      '$ \\ln(x) - 1 $', // Mauvaise réponse (d)
    ]

    this.enonce =
      `On considère la fonction $f$ définie et dérivable sur $]0~;~+\\infty[$ par${sp()}: `
    this.enonce += '$f(x) = x \\ln(x) - x + 1.$<br>'
    this.enonce +=
      `Parmi les quatre expressions suivantes, laquelle est celle de la fonction dérivée de $f$${sp()}?`

    this.correction =
      'La fonction $f$ est dérivable sur $]0~;~+\\infty[$, en tant que produit et somme de fonctions dérivables.<br>'
    this.correction += `Pour tout $x > 0$, on a${sp()}:<br>`
    this.correction +=
      "$f'(x) = 1 \\times \\ln(x) + x \\times \\dfrac{1}{x} - 1 + 0 = \\ln(x) + 1 - 1 = \\ln(x).$<br>"
    this.correction += `La bonne réponse est donc la réponse $${miseEnEvidence(' \\ln(x) ')}$`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
