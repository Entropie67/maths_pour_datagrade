import { sp } from '../../lib/outils/outilString'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import ExerciceQcm from '../ExerciceQcm'

export const uuid = '10fbc'
export const refs = {
  'fr-fr': ['TSP2-19', 'TCP1-29'],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Calculer une probabilité à l'aide de l'événement contraire dans une loi binomiale (QCM Bac)"
export const dateDePublication = '11/03/2025'
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
export default class metropoleSept2024Ex4Q1 extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.enonce = this.sup3
      ? `Un jeu vidéo possède une vaste communauté de joueurs en ligne.<br> Avant de débuter une partie, le joueur doit choisir entre deux «${sp()}mondes${sp()}» : soit le monde A, soit le monde B.
<br>On choisit au hasard un individu dans la communauté des joueurs.<br>
Lorsqu'il joue une partie, on admet que :<br>
$\\bullet~~$ la probabilité que le joueur choisisse le monde A est égale à $\\dfrac25$ ;<br>
$\\bullet~~$ si le joueur choisit le monde A, la probabilité qu'il gagne la partie est de $\\dfrac{7}{10}$ ;<br>
$\\bullet~~$ la probabilité que le joueur gagne la partie est de $\\dfrac{12}{25}$.<br>
On considère les évènements suivants : <br>
$\\bullet~~$ $A$ : «${sp()}Le joueur choisit le monde A${sp()}» ; <br>
$\\bullet~~$ $B$ : «${sp()}Le joueur choisit le monde B${sp()}» ;<br>
$\\bullet~~$ $G$ : «${sp()}Le joueur gagne la partie${sp()}» .<br><br>`
      : ''

    this.reponses = [
      '$1 - \\left(\\dfrac{13}{25}\\right)^{10}$', // Réponse correcte (d)
      '$1 - \\left(\\dfrac{12}{25}\\right)^{10}$', // Mauvaise réponse (a)
      '$\\left(\\dfrac{13}{25}\\right)^{10}$', // Mauvaise réponse (b)
      '$\\left(\\dfrac{12}{25}\\right)^{10}$', // Mauvaise réponse (c)
    ]

    this.enonce +=
      'La probabilité que le joueur gagne au moins une partie est égale à :'

    this.correction = "On utilise l'événement complémentaire :<br>"
    this.correction +=
      '$P(X \\geqslant 1) = 1 - P(X = 0) = 1 - \\left(\\dfrac{13}{25}\\right)^{10}.$<br>'
    this.correction += `La bonne réponse est donc $${miseEnEvidence('1 - \\left(\\dfrac{13}{25}\\right)^{10}')}$.`
  }

  constructor() {
    super()

    this.versionOriginale()
    this.besoinFormulaire3CaseACocher = ["Avec le préambule de l'énoncé", true]
    this.sup3 = true
  }
}
