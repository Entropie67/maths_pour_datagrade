// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid a63b6 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'a63b6'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Amérique 05/22 : équation'
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
  constructor() {
    super()
    this.options.vertical = true
    this.reponses = [
      "L'équation $(E)$ admet une unique solution réelle.", // Réponse correcte (c)
      '$3$ est solution de $(E)$.', // Mauvaise réponse (a)
      '$5 - \\sqrt{46}$ est solution de $(E)$.', // Mauvaise réponse (b)
      "L'équation $(E)$ admet deux solutions réelles.", // Mauvaise réponse (d)
    ]

    this.enonce = `On note $(E)$ l'équation suivante${sp()}:<br>`
    this.enonce +=
      "$\\ln x + \\ln (x - 10) = \\ln 3 + \\ln 7$ d'inconnue le réel $x$.<br>"
    this.enonce += `Parmi les affirmations suivantes, laquelle est correcte${sp()}?`

    this.correction =
      `Donnons d'abord le domaine de définition de l'équation $(E)$${sp()}:<br>`
    this.correction +=
      'Il faut que $x > 0$ et $x > 10$, donc $\\mathcal{D}_f = ]10~;~+\\infty[$.<br>'
    this.correction += `Dans $\\mathcal{D}_f$, on a${sp()}:<br>`
    this.correction +=
      '$\\ln(x) + \\ln(x - 10) = \\ln(3) + \\ln(7) \\iff \\ln(x(x - 10)) = \\ln(21).$<br>'
    this.correction +=
      `Par croissance de la fonction logarithme népérien, cela équivaut à${sp()}:<br>`
    this.correction += '$x(x - 10) = 21 \\iff x^2 - 10x - 21 = 0.$<br>'
    this.correction +=
      `Le discriminant de cette équation est $\\Delta = 184 > 0$, donc il y a deux solutions réelles${sp()}:<br>`
    this.correction +=
      '$x_1 = \\dfrac{10 - 2\\sqrt{46}}{2} = 5 - \\sqrt{46} \\quad \\text{et} \\quad x_2 = \\dfrac{10 + 2\\sqrt{46}}{2} = 5 + \\sqrt{46}.$<br>'
    this.correction +=
      `Or, $5^2 = 25 < 46$, donc $5 < \\sqrt{46}$. Cela implique${sp()}:<br>`
    this.correction +=
      '- $5 - \\sqrt{46} < 0$, donc $x_1 \\notin \\mathcal{D}_f$.<br>'
    this.correction +=
      '- $5 + \\sqrt{46} > 10$, donc $x_2 \\in \\mathcal{D}_f$.<br>'
    this.correction += `Ainsi, l'équation $(E)$ admet une unique solution réelle, qui est $${miseEnEvidence('5 + \\sqrt{46}')}$.<br>`
  }
}
