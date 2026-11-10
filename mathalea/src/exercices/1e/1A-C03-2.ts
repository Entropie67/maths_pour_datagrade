import CalculPuissancesOperation from '../can/2e/can2N4-03'
export const titre = 'Simplifier avec les propriétés des puissances'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2N4-03 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = '32a31'

export const refs = {
  'fr-fr': ['1A-C03-2', '2A-N3-2'],
  'fr-ch': ['10LCNO4B-9', '10LSNO4B-9', '11LCNO3B-9', '11LSNO3B-9'],
}
export default class Auto1AC3b extends CalculPuissancesOperation {
  constructor() {
    super()
    this.versionQcm = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut simplifier une expression avec des puissances.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Regarder si les puissances ont la même base (le nombre élevé à une puissance) ou le même exposant.</li>
    <li>Se rappeler les propriétés du cours : produit, quotient et puissance d'une puissance.</li>
    <li>Écrire un petit exemple développé au brouillon en cas d'hésitation.</li>
  </ul>
`
  }
}
