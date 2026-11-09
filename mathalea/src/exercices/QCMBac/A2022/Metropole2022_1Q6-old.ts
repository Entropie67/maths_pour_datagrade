// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid dff98 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'dff98'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 05/22 : exponentielle.'
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
      '$0$', // Réponse correcte (d)
      '$\\dfrac{2}{3}$', // Mauvaise réponse (a)
      '$+\\infty$', // Mauvaise réponse (b)
      '$-\\infty$', // Mauvaise réponse (c)
    ]

    this.reponses = [
      'Une seule solution', // Réponse correcte (c)
      'Trois solutions', // Mauvaise réponse (a)
      'Deux solutions', // Mauvaise réponse (b)
      'Aucune solution', // Mauvaise réponse (d)
    ]

    this.enonce = `L'équation${sp()}: `
    this.enonce += '$\\mathrm{e}^{2x} + \\mathrm{e}^x - 12 = 0$'
    this.enonce += ` admet dans $\\mathbb R$${sp()}:`

    this.correction = `On pose $X = \\mathrm{e}^x$. L'équation devient${sp()}:<br>`
    this.correction += '$X^2 + X - 12 = 0.$<br>'
    this.correction += 'Les solutions sont $X = -4$ et $X = 3$.<br>'
    this.correction +=
      'Or, $X = \\mathrm{e}^x > 0$, donc seule $X = 3$ est acceptable.<br>'
    this.correction +=
      `Ainsi, l'équation $\\mathrm{e}^x = 3$ admet une unique solution${sp()}: $x = \\ln(3)$.<br>`
    this.correction += `La solution est donc ${texteEnCouleurEtGras('une seule solution')}.`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
