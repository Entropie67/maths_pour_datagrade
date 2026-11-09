// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 7233e continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import calculPuissancesNegativeFraction from '../can/2e/can2N4-04'
export const titre = 'Calculer $\\dfrac{1}{a}$ à la puissance $-1$ ou $-2$'
export const dateDePublication = '02/02/2026'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2N4-04 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '7233e'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC03nOld extends calculPuissancesNegativeFraction {
  constructor() {
    super()
    this.versionQcm = true
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut utiliser le sens d'un exposant négatif.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Se rappeler que pour $a \\neq 0$, $a^{-1}=\\dfrac{1}{a}$.</li>
    <li>Se rappeler aussi que $a^{-2}=\\dfrac{1}{a^2}$.</li>
    <li>Observer que la base(le nombre élevé à une puissance) est déjà une fraction de la forme $\\dfrac{1}{a}$.</li>
    <li>Commencer par réfléchir au cas de l'exposant $-1$.</li>
  </ul>`
  }
}
