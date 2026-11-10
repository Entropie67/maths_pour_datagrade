// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 06571 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '06571'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Polynésie 05/22 : équation'
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
      '$3$', // Réponse correcte (d)
      '$0$', // Mauvaise réponse (a)
      '$1$', // Mauvaise réponse (b)
      '$2$', // Mauvaise réponse (c)
    ]

    this.enonce = 'On considère la fonction $f$ définie sur $\\R$ par '
    this.enonce += '$f(x) = x^3 - 0{,}9x^2 - 0{,}1x.$<br>'
    this.enonce +=
      `Le nombre de solutions de l'équation $f(x) = 0$ sur $\\R$ est${sp()}:`

    this.correction = `On factorise $f(x)$${sp()}:<br>`
    this.correction += '$f(x) = x(x^2 - 0{,}9x - 0{,}1).$<br>'
    this.correction += `Ainsi, $f(x) = 0$ équivaut à${sp()}:<br>`
    this.correction +=
      '$x = 0 \\quad \\text{ou} \\quad x^2 - 0{,}9x - 0{,}1 = 0.$<br>'
    this.correction +=
      `L'équation du second degré $x^2 - 0{,}9x - 0{,}1 = 0$ admet deux solutions${sp()}: $1$ et $-0{,}1$.<br>`
    this.correction += `Donc, l'équation $f(x) = 0$ admet ${texteEnCouleurEtGras('trois solutions')}.`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
