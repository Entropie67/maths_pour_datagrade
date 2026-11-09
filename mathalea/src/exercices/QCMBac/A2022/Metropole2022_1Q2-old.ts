// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 752b3 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceQcm from '../../ExerciceQcm'
import { sp } from '../../../lib/outils/outilString'

export const uuid = '752b3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Métropole 05/22 : primitive'
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
      '$F(x) = \\dfrac{1}{2}\\mathrm{e}^{x^2} + \\dfrac{1}{2}$', // Réponse correcte (d)
      '$F(x) = \\dfrac{x^2}{2}\\mathrm{e}^{x^2}$', // Mauvaise réponse (a)
      '$F(x) = \\dfrac{1}{2}\\mathrm{e}^{x^2}$', // Mauvaise réponse (b)
      '$F(x) = \\left(1 + 2x^2\\right)\\mathrm{e}^{x^2}$', // Mauvaise réponse (c)
    ]

    this.enonce = 'Soit $f$ la fonction définie sur $\\R$ par '
    this.enonce += '$f(x) = x\\mathrm{e}^{x^2}.$<br>'
    this.enonce +=
      `La primitive $F$ de $f$ sur $\\R$ qui vérifie $F(0) = 1$ est définie par${sp()}:`

    this.correction =
      "On remarque que $f(x)$ est de la forme $u'(x) \\times \\mathrm{e}^{u(x)}$ avec $u(x) = x^2$.<br>"
    this.correction += `Ainsi, une primitive de $f$ est${sp()}:`
    this.correction += '$F(x) = \\dfrac{1}{2} \\mathrm{e}^{x^2} + k,$ '
    this.correction += 'où $k$ est une constante.<br>'
    this.correction +=
      `On utilise la condition $F(0) = 1$ pour déterminer $k$${sp()}:<br>`
    this.correction +=
      '$\\dfrac{1}{2} \\mathrm{e}^{0} + k = 1 \\iff \\dfrac{1}{2} + k = 1 \\iff k = \\dfrac{1}{2}.$<br>'
    this.correction += `Donc, la primitive recherchée est${sp()}:`
    this.correction +=
      ' $F(x) = \\dfrac{1}{2} \\mathrm{e}^{x^2} + \\dfrac{1}{2}.$<br>'
    this.correction += `La bonne réponse est donc $${miseEnEvidence('F(x) = \\dfrac{1}{2}\\mathrm{e}^{x^2} + \\dfrac{1}{2}')}$.`
  }

  constructor() {
    super()
    this.options.vertical = true
    this.versionOriginale()
  }
}
