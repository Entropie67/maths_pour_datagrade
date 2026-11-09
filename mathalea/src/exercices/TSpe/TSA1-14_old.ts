import N2PlusRacineDeN from '../can/TSpe/canTSpeS04'
export const titre = 'Calculer la limite de $\\dfrac{a\\pm kn}{n}$'
export const dateDePublication = '04/08/2025'
export const interactifReady = true

/**
 * Clone de CanTspeE01 pour les auto 1er
 * @author Stéphane Guyon
 */

export const uuid = '1b8d1'

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
