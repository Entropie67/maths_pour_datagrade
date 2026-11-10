import FractionDecimaleEcritureDecimale2 from '../can/5e/can5C4-10'
export const titre = 'Passer de la fraction décimale à l’écriture décimale'
export const dateDePublication = '04/08/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2C22 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '87440'

export const refs = {
  'fr-fr': ['1A-C04-1', '2A-N4-1'],
  'fr-ch': ['9R1NO4E-5', '9R2NO4E-5', '9R3NO4E-5'],
}
export default class Auto1AC4 extends FractionDecimaleEcritureDecimale2 {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut convertir une somme de fractions décimales en un nombre décimal.<br>
    Le plus simple consiste à écrire chaque fraction décimale en nombre décimal puis d'effectuer la somme.
  </p>
  
`
    this.versionQcm = false
  }
}
