import CompareAireEtPerimetreAvecRectangle from './6M2autoA'

export const dateDePublication = '28/07/2025'
export const titre = 'Comparer périmètres de figures'
export const interactifReady = true

/**
 * Comparer périmètres de figures avec ceux d'un rectangle référence
 * @author Éric Elter
 */
export const uuid = '316d2'

export const refs = {
  'fr-fr': ['6M1autoE', '6AutoL3-1'],
  'fr-2016': ['6M21-1'],
  'fr-ch': ['9R1GM1A-4', '9R2GM1A-4', '9R3GM1A-4', 'PRQMG01B-9'],
}
export default class ComparePerimetreAvecRectangle extends CompareAireEtPerimetreAvecRectangle {
  constructor() {
    super()
    this.sup2 = 1
    this.besoinFormulaire2Numerique = false
  }
}
