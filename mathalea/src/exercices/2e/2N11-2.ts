import PlacerPointsAbscissesFractionnaires from '../CM2/CM2N2E-2'
export const titre = 'Utiliser les abscisses fractionnaires'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '27/10/2021'
/**
 * Clone de 6N21 pour les 2nde // OM : CM2N2E-2 maintenant
 *
 * @author Jean-claude Lhote
 */
export const uuid = '7cfbe'

export const refs = {
  'fr-fr': ['2N11-2'],
  'fr-ch': ['NR'],
}
export default class PlacerPointsAbscissesFractionnaires2nde extends PlacerPointsAbscissesFractionnaires {
  constructor() {
    super()
    this.sup = 5
    this.sup2 = true
    this.sup3 = false
  }
}
