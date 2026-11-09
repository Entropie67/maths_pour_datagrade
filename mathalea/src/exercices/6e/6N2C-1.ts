import MultiplierEntierPar101001000 from './6AutoN4-2'
export const dateDePublication = '28/09/2026'
export const titre = 'Diviser un entier par $10$, $100$, $1\\,000$'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Éric Elter
 */

export const uuid = '11496'

export const refs = {
  'fr-fr': ['6N2C-1'],
  'fr-ch': ['NR'],
}
export default class DiviserEntierPar101001000 extends MultiplierEntierPar101001000 {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Division par 10, 100 ou 1 000\n2 : Division par 10, 100, 1 000, 10 000 ou 100 000',
    ]
    this.sup = 1
    this.besoinFormulaire2Numerique = false
    this.sup2 = 2
  }
}
