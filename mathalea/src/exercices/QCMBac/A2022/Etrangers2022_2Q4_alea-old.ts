// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 01eb1 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '01eb1'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Centres étrangers 05/22 : domaine'
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
      '$]- 3~;~2[$',
      '$]- \\infty~;~6]$',
      '$]0~;~+\\infty[$',
      '$]2~;~+\\infty[$',
    ]

    this.enonce =
      ' La fonction $x \\longmapsto \\ln \\left(-x^2- x + 6\\right)$ est définie sur '
    this.correction =
      'La fonction est définie si $- x^2 - x + 6 > 0 \\iff x^2 + x - 6 < 0$.'
    this.correction +=
      `<br>Le trinôme $x^2 +x - 6$ a une racine évidente${sp()}: $2$.<br>`
    this.correction +=
      " Le produit des racines étant égal à $-6$, l'autre racine est donc $-3$.<br>"
    this.correction +=
      `On aurait pu aussi calculer le discriminant${sp()}: $\\Delta = 1^2 - 4 \\times 1 \\times (- 6) = 1 + 24 = 25$,<br>`
    this.correction +=
      'ce qui donne aussi $x_1 = \\dfrac{- 1 - 5}{2} = - 3$ et $x_2 = \\dfrac{- 1 + 5}{2} = 2$.<br>'
    this.correction +=
      "On sait que ce trinôme est du signe de $a=1$, donc positif, à l'extérieur de ses racines. Il est donc négatif entre les racines $-3$ et $2$.<br>"
    this.correction += `La fonction est donc définie sur l'intervalle $${miseEnEvidence(']-3~;~2[')}$.`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
