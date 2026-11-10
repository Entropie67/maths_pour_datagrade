import ÉcrirePourcentageDecimal from '../can/5e/can5P2-04'
export const titre = 'Écrire un pourcentage sous forme décimale'
export const dateDePublication = '30/10/2026'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Clone de can5P2-04 pour les automatismes de 1re
 * @author Gilles Mora
 */

export const uuid = '39c3f'

export const refs = {
  'fr-fr': ['1A-C04-11'],
  'fr-ch': ['9R1NO4G-5', '9R2NO4G-5', '9R3NO4G-5'],
}
export default class Auto1AC4k extends ÉcrirePourcentageDecimal {
  constructor() {
    super()
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut écrire un pourcentage sous forme décimale.<br>
    Se rappeler qu'un pourcentage est une fraction de dénominateur $100$.
  </p>`
  }
}
