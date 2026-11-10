import { sp } from '../../lib/outils/outilString'
import ExerciceQcm from '../ExerciceQcm'

export const uuid = '002b6'
export const refs = {
  'fr-fr': ['TSP2-13', 'TCP1-23'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une probabilité avec une loi binomiale (QCM Bac)'
export const dateDePublication = '28/10/2024'
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
export default class SujetZero2024Ex5Q5 extends ExerciceQcm {
  versionOriginale: () => void = () => {
    this.reponses = [
      '$\\left(1 + n + \\dfrac{n(n-1)}{2}\\right) \\times\\left(\\dfrac{1}{2}\\right)^{n}$',
      '$\\dfrac{n(n-1)}{2}$',
      '$\\dfrac{n(n-1)}{2} \\times\\left(\\dfrac{1}{2}\\right)^{n}$',
      '$1 + n + \\dfrac{n(n-1)}{2}$',
    ]

    this.enonce = `On effectue $n$ lancers d'une pièce de monnaie équilibrée.<br> 
    Le résultat d'un lancer est «${sp()}pile${sp()}» ou «${sp()}face${sp()}».<br> 
    On considère la liste ordonnée des $n$ résultats.<br>
Quelle est la probabilité d'obtenir au plus deux fois «${sp()}pile${sp()}» dans cette liste ?`
    this.correction =
      `La variable aléatoire $X$ qui donne le nombre de résultats «${sp()}pile${sp()}» sur $n$ lancers suit la loi binomiale de paramètres $n$ et $\\dfrac{1}{2}$.<br>`
    this.correction +=
      'On cherche $P(X\\leqslant 2)$ soit $P(X=0)+P(X=1)+P(X=2)$.<br>'
    this.correction +=
      '$\\bullet~~P(X=0)=\\displaystyle\\binom{n}{0}\\left (\\dfrac{1}{2}\\right )^0 \\left (1-\\dfrac{1}{2}\\right )^{n-0} = \\left (\\dfrac{1}{2}\\right )^n$<br>'
    this.correction +=
      '$\\bullet~~P(X=1)=\\displaystyle\\binom{n}{1}\\left (\\dfrac{1}{2}\\right )^1 \\left (1-\\dfrac{1}{2}\\right )^{n-1} = n \\left (\\dfrac{1}{2}\\right )^n$<br>'
    this.correction +=
      '$\\bullet~~P(X=2)=\\displaystyle\\binom{n}{2}\\left (\\dfrac{1}{2}\\right )^2 \\left (1-\\dfrac{1}{2}\\right )^{n-2} = \\dfrac{n(n-1)}{2} \\left (\\dfrac{1}{2}\\right )^n$<br>'
    this.correction +=
      'Donc $P(X\\leqslant 2)= \\left (\\dfrac{1}{2}\\right )^n + n \\left (\\dfrac{1}{2}\\right )^n + \\dfrac{n(n-1)}{2}\\left (\\dfrac{1}{2}\\right )^n = \\left (1+n+\\dfrac{n(n-1)}{2}\\right )\\left (\\dfrac{1}{2}\\right )^n$.'
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
