// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 56e02 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '56e02'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 05/2022 : asymptote'
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
      '$y = -2$', // Réponse correcte (c)
      '$x = -2$', // Mauvaise réponse (a)
      '$y = -1$', // Mauvaise réponse (b)
      '$y = 0$', // Mauvaise réponse (d)
    ]

    this.enonce =
      'La courbe représentative de la fonction $f$ définie sur $\\R$ par '
    this.enonce += '$f(x) = \\dfrac{-2x^2 + 3x - 1}{x^2 + 1}$<br>'
    this.enonce += `admet pour asymptote la droite d'équation${sp()}:`

    this.correction =
      `Pour déterminer l'asymptote, on étudie la limite de $f(x)$ en $+\\infty$${sp()}:<br>`
    this.correction +=
      '$f(x) = \\dfrac{x^2\\left(-2 + \\dfrac{3}{x} - \\dfrac{1}{x^2}\\right)}{x^2\\left(1 + \\dfrac{1}{x^2}\\right)} = \\dfrac{-2 + \\dfrac{3}{x} - \\dfrac{1}{x^2}}{1 + \\dfrac{1}{x^2}}.$<br>'
    this.correction +=
      'Ainsi, $\\displaystyle\\lim_{x \\to +\\infty} f(x) = -2$.<br>'
    this.correction +=
      "La droite d'équation $y = -2$ est donc une asymptote horizontale à la courbe de $f$.<br>"
    this.correction += `La bonne réponse est donc $${miseEnEvidence('y = -2')}$.`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
