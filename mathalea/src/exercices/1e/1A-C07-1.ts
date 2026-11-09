import MinutesHeuresDecimale from '../can/6e/can6D3-02'

export const dateDeModifImportante = '29/09/2026'

export const uuid = '6fd2a'
export const refs = {
  'fr-fr': ['1A-C07-1', '2A-N7-1'],
  'fr-ch': ['10CTQCMGM-1', '10LCQCMGM-1', '10LSQCMGM-1'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Transformer des minutes en heures décimales'
export const dateDePublication = '04/09/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC7 extends MinutesHeuresDecimale {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
