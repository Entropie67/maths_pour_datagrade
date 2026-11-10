import PuissanceDecimaleOuFractionnaire from '../4e/4C35'
export const titre =
  'Transformer une écriture de puissance en écriture décimale'
export const dateDePublication = '01/05/2025'
export const interactifReady = true

/**
 * @author Rémi Angot
 */

export const uuid = '76472'

export const refs = {
  'fr-fr': ['5_2026_P1'],
  'fr-2016': ['5_2026_P1'],
  'fr-ch': ['9R1NO5A-4', '9R2NO5A-4', '9R3NO5A-4', 'PRQNO03B-3', 'PRQNO07A-2'],
}
export default class PuissanceCarreEtCube extends PuissanceDecimaleOuFractionnaire {
  constructor() {
    super()
    this.classe = 5
    this.besoinFormulaireCaseACocher = false
    this.besoinFormulaire2CaseACocher = false
    this.sup = false
    this.sup2 = true
  }
}
