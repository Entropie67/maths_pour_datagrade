import PuissancesDeDix from '../4e/4C30'
export const titre =
  'Utiliser les règles de calculs avec des puissances de $10$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDePublication = '05/09/2023'
export const uuid = '6b2e5'

export const refs = {
  'fr-fr': ['2N41-1', 'BP2AutoE2'],
  'fr-ch': ['10LCNO4C-4', '10LSNO4C-4'],
}
/**
 *
 */
export default class PuissancesDeDix2 extends PuissancesDeDix {
  constructor() {
    super()
    this.sup = 3
    this.correctionDetaillee = false
    this.besoinFormulaireNumerique = [
      'Règle à travailler',
      3,
      '1 : Calculs de base\n2 : Calculs plus complexes\n3 : Mélange',
    ]
    this.besoinFormulaire2Texte = false
  }
}
