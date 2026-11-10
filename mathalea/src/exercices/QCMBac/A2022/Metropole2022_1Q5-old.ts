// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid e9e43 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'e9e43'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 05/22 : limites'
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

    this.enonce =
      'La limite en $+\\infty$ de la fonction $f$ définie sur $]0~;~+\\infty[$ par '
    this.enonce += '$f(x) = \\dfrac{2\\ln x}{3x^2 + 1}$'
    this.enonce += ` est égale à${sp()}:`

    this.correction = `On utilise les croissances comparées${sp()}:<br>`
    this.correction +=
      '$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{\\ln x}{x^2} = 0.$<br>'
    this.correction += `Ainsi, on a${sp()}:<br>`
    this.correction +=
      '$\\displaystyle\\lim_{x \\to +\\infty} f(x) = \\displaystyle\\lim_{x \\to +\\infty} \\dfrac{2\\ln x}{3x^2 + 1} = 0.$<br>'
    this.correction += `La bonne réponse est donc $${miseEnEvidence('0')}$.`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
