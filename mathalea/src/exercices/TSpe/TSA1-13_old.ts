import N2PlusRacineDeN from '../can/TSpe/canTSpeS03'
export const titre = 'Calculer la limite de $e^{-n}\\pm kn$'
export const dateDePublication = '04/08/2025'
export const interactifReady = true

/**
 * Clone de CanTspeE01 pour les auto 1er
 * @author Stéphane Guyon
 */

export const uuid = '1b8d0'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class N2PlusRacineDeNUn extends N2PlusRacineDeN {
  constructor() {
    super()
    this.nbQuestions = 2
  }
}
