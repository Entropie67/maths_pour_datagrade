import calculPuissancesAvecn from '../can/2e/can2N4-05'
export const titre = 'Déterminer une puissance dans une égalité'
export const dateDePublication = '23/03/2026'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2N4-05 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '71491'

export const refs = {
  'fr-fr': ['1A-C03-16', '2A-N3-11'],
  'fr-ch': ['10LCNO4B-11', '10LSNO4B-11', '11LCNO3B-11', '11LSNO3B-11'],
}
export default class Auto1AC3p extends calculPuissancesAvecn {
  constructor() {
    super()
    this.versionQcm = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut retrouver une valeur de $n$ dans une égalité avec des puissances.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Transformer l'addition de deux termes identiques en une multiplication par $2$.</li>
    <li>Écrire ensuite toutes les puissances avec la même base (le nombre élevé à une puissance).</li>
    <li>Comparer les exposants quand deux puissances de même base sont égales.</li>
  </ul>
`
  }
}
