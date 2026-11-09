import ExerciceQcm from '../ExerciceQcm'

export const uuid = '48bb3'
export const refs = {
  'fr-fr': ['TSP2-12', 'TCP1-22'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Déterminer le paramètre d'une loi binomiale (QCM Bac)"
export const dateDePublication = '05/11/2024'
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
      '$p = \\dfrac{4}{5}$',
      '$p = \\dfrac{1}{5}$',
      '$p(X = 1) =\\dfrac{124}{125}$',
      '$p(X= 1) =\\dfrac{4}{5}$',
    ]

    this.enonce =
      'On considère la variable aléatoire $X$ suivant la loi binomiale $\\mathcal{B}(3~;~p)$.<br> On sait que $P(X = 0) = \\dfrac{1}{125}$.<br>'
    this.enonce += 'On peut affirmer que :'
    this.correction =
      '$P(X=0) = \\displaystyle\\binom{3}{0}\\times p^0 \\times (1-p)^{3-0} =  (1-p)^3$<br>'
    this.correction +=
      'On a donc $(1-p)^3 = \\dfrac{1}{125} \\iff (1-p)^3 = \\left(\\dfrac{1}{5}\\right)^3 \\iff 1-p=\\dfrac{1}{5}$;<br>'
    this.correction += ' donc $p=\\dfrac{4}{5}$.'
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
