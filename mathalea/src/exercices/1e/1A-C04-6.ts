import ÉcrirePourcentage from '../can/5e/can5P2-02'
export const titre = 'Écrire un décimal sous la forme d’un pourcentage'
export const dateDePublication = '09/12/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2C22 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '8e718'

export const refs = {
  'fr-fr': ['1A-C04-6', '2A-N4-6'],
  'fr-ch': ['9R1NO4G-4', '9R2NO4G-4', '9R3NO4G-4'],
}
export default class Auto1AC4f extends ÉcrirePourcentage {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut écrire un nombre sous forme de pourcentage.<br>
 

    Se rappeler qu'un pourcentage est une fraction de dénominateur $100$.
  
  </p>`
  }
}
