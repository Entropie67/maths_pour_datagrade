import PerimetreAireDisques from '../5e/5G2E-1'

export const titre = 'Calculer périmètre de disques'
export const dateDePublication = '27/07/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Calculer périmètre de disques
 * @author Éric Elter (comme clone de 5M11-3 de Rémi Angot)
 */

export const uuid = 'f2a18'

export const refs = {
  'fr-fr': ['6M1C'],
  'fr-2016': ['6M22-1a'],
  'fr-ch': ['NR'],
}
export default class PerimetreDisques extends PerimetreAireDisques {
  constructor() {
    super()
    this.besoinFormulaireNumerique = false
    this.sup = 1
  }
}
