// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 70139 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '70139'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Polynésie 05/2022 : primitive'
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
      '$K(x) = \\dfrac{1}{2}H(2x)$', // Réponse correcte (c)
      '$K(x) = H(2x)$', // Mauvaise réponse (a)
      '$K(x) = 2H(2x)$', // Mauvaise réponse (b)
      '$K(x) = 2H(x)$', // Mauvaise réponse (d)
    ]

    this.enonce =
      "Si $H$ est une primitive d'une fonction $h$ définie et continue sur $\\R$,<br>"
    this.enonce +=
      'et si $k$ est la fonction définie sur $\\R$ par $k(x) = h(2x)$,<br>'
    this.enonce += `alors, une primitive $K$ de $k$ est définie sur $\\R$ par${sp()}:`

    this.correction =
      `On dérive la proposition $K(x) = \\dfrac{1}{2}H(2x)$${sp()}:<br>`
    this.correction +=
      "$K'(x) = \\dfrac{1}{2} \\times 2H'(2x) = H'(2x) = h(2x) = k(x).$<br>"
    this.correction +=
      'Ainsi, $K(x) = \\dfrac{1}{2}H(2x)$ est bien une primitive de $k$.<br>'
    this.correction += `La bonne réponse est donc $${miseEnEvidence('\\dfrac{1}{2}H(2x))')}$ `
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
