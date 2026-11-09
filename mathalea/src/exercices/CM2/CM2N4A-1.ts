import TablesDeMultiplications from '../6e/_Tables_de_multiplications'
export const titre = 'Connaître les tables de multiplication'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '27/08/2024'

/**
 *
 * @author Jean-claude Lhote
 */
export const uuid = '4e27f'

export const refs = {
  'fr-fr': ['CM2N4A-1', '6N3autoD-1', '5N3autoA', '5N4autoA', 'CM1N4A-2'],
  'fr-2016': ['c3C10-1'],
  'fr-ch': ['NR'],
}
export default class TablesDeMultiplicationsCM extends TablesDeMultiplications {
  constructor() {
    super()
    this.sup2 = '1'
  }
}
