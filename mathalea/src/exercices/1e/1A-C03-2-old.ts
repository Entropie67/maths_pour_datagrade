// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 71eba continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import CalculPuissancesOperation from '../can/2e/can2N4-03'
export const titre = 'Simplifier avec les propriétés des puissances'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2N4-03 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '71eba'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC3bOld extends CalculPuissancesOperation {
  constructor() {
    super()
    this.versionQcm = true
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
