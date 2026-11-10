// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid e4f38 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'e4f38'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Centres étrangers 05/22 : inéquation'
export const dateDePublication = '25/02/2025'
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
      '$S = ]1~;~+ \\infty[$ ',
      '$S = ]- \\infty~;~-2[ \\cup ]1~;~+\\infty[$',
      '$S = \\emptyset$',
      '$S = ]- 1~;~1[$',
    ]

    this.enonce =
      ` L'ensemble $S$ des solutions dans $\\mathbb {R}$ de l'inéquation $\\ln (x + 3) < 2\\ln (x + 1)$ est${sp()}:<br>`
    this.correction = "D'après l'énoncé il faut que $x > -3$ et que $x > - 1$. "
    this.correction +=
      "<br>Il faut donc résoudre l'inéquation dans l'intervalle $]- 1~;~+ \\infty[$."
    this.correction +=
      `<br>On a${sp()}:<br>$\\begin{aligned}\\phantom{\\iff}&\\ln (x + 3) < 2\\ln (x + 1)\\\\ \\iff& \\ln (x + 3) < \\ln (x + 1)^2 \\\\ \\iff& x + 3 <  (x + 1)^2 \\\\ \\iff & 0 < x^2 + 2x + 1 - x - 3 \\\\ \\iff& 0< x^2 + x - 2 \\end{aligned}$.`
    this.correction +=
      "<br>Le trinôme $x^2 + x - 2$ a une racine évidente $1$ ; comme le produit des racines est égal à $- 2$, l'autre racine est $- 2$."
    this.correction +=
      `<br>On aurait pu calculer le discriminant${sp()}: $\\Delta = 1^2 - 4 \\times 1 \\times (- 2) = 1 + 8 = 9 > 0$.`
    this.correction += '<br>On retrouverait les mêmes racines $1$ et $- 2$.'
    this.correction +=
      `<br>On a donc${sp()}: le trinôme est du signe de $a$, donc positif (ce que l'on cherche) sauf entre les racines.`
    this.correction += `<br> D'après la remarque préliminaire  $${miseEnEvidence('S = \\left]1~;~+ \\infty\\right[')}$. `
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
