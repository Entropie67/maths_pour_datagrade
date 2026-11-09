import FonctionsProbabilite1 from '../6e/6P2B-1'
export const titre = 'Décrire une expérience aléatoire'
export const interactifReady = false
export const dateDePublication = '03/04/2022'

/**
 * @author Guillaume Valmont
 */
export const uuid = 'df72b'

export const refs = {
  'fr-fr': ['5D2B'],
  'fr-2016': ['5S22'],
  'fr-ch': ['11CTNO4A-1', '11LCNO4A-1', '11LSNO4A-1'],
}
export default class FonctionsVocabulaireProbabilite5e extends FonctionsProbabilite1 {
  constructor() {
    super()
    this.niveau = 2
    this.spacingCorr = 2
    this.interactifReady = false
  }
}
