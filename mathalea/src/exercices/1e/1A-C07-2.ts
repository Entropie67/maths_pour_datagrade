import HeureDecimalesMinutes from '../can/6e/can6D3-03'

export const dateDeModifImportante = '29/09/2026'

export const uuid = '02db5'
export const refs = {
  'fr-fr': ['1A-C07-2', '2A-N7-2'],
  'fr-ch': ['10CTQCMGM-2', '10LCQCMGM-2', '10LSQCMGM-2'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Transformer des heures décimales en minutes'
export const dateDePublication = '05/09/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC7a extends HeureDecimalesMinutes {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
