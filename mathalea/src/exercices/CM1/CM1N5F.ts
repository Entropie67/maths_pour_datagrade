import DivisionsEuclidiennes from '../6e/6N2J'
export const titre = 'Poser des divisions euclidiennes'
export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

export const dateDePublication = '01/02/2026'
/**
 * @author Éric Elter
 */
export const uuid = 'b659a'

export const refs = {
  'fr-fr': ['CM1N5F'],
  'fr-ch': ['NR'],
}
export default class DivisionsEuclidiennesCM1 extends DivisionsEuclidiennes {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Divisions par 2, 3, 4 ou 5\n2 : Divisions par 6, 7, 8 ou 9',
    ]
    this.sup = 1
    this.besoinFormulaire3Numerique = [
      'Choisir son diviseur entier (Entre 1 et 9)',
      9,
    ]
    this.sup3 = 7
  }
}
