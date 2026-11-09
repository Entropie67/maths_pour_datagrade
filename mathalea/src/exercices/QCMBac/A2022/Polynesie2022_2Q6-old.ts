// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid faefb continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'faefb'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Polynésie 05/22 : équation'
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
      '$n \\geqslant 5$', // Réponse correcte (d)
      '$n \\leqslant 4$', // Mauvaise réponse (a)
      '$n \\leqslant 5$', // Mauvaise réponse (b)
      '$n \\geqslant 4$', // Mauvaise réponse (c)
    ]

    this.enonce = "Les nombres entiers $n$ solutions de l'inéquation "
    this.enonce += '$(0,2)^n < 0,001$<br>'
    this.enonce += `sont tous les nombres entiers $n$ tels que${sp()}:`

    this.correction = `On résout l'inéquation${sp()}:<br>`
    this.correction +=
      '$(0,2)^n < 0,001 \\iff \\ln(0,2^n) < \\ln(0,001) \\iff n\\ln(0,2) < \\ln(0,001).$<br>'
    this.correction +=
      `Comme $\\ln(0,2) < 0$, on divise par un nombre négatif, ce qui inverse l'inégalité${sp()}:<br>`
    this.correction += '$n > \\dfrac{\\ln(0,001)}{\\ln(0,2)}.$<br>'
    this.correction +=
      'On calcule $\\dfrac{\\ln(0,001)}{\\ln(0,2)} \\approx 4,3$.<br>'
    this.correction +=
      'Ainsi, les solutions sont les entiers $n \\geqslant 5$.<br>'
    this.correction += `La bonne réponse est donc $${miseEnEvidence('n \\geqslant 5')}$.`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
