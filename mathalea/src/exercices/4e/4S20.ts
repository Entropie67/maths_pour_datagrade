import FonctionsProbabilite6e from '../6e/6P2B-1'
export const titre = 'Utiliser le vocabulaire des probabilités'
export const interactifReady = false
export const dateDePublication = '03/04/2022'

/**
 * @author Guillaume Valmont
 */
export const uuid = '7ba64'

export const refs = {
  'fr-fr': ['4S20', 'BP2FLUC10'],
  'fr-ch': ['11LCNO4B-1', '11LSNO4B-1'],
}
export default class FonctionsVocabulaireProbabilite4e extends FonctionsProbabilite6e {
  constructor() {
    super()
    this.niveau = 4
    this.spacingCorr = 2
    this.interactifReady = false
  }
}
