import Transformations from '../6e/_Transformations'
export const titre =
  "Trouver l'image d'un point par une symétrie axiale ou centrale"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '31/03/2025'

/**
 * Transformations : trouvers un point numéroté par une des transformations du plan. Fonction générale utilisée sur tous les niveaux
 * @author Jean-claude Lhote
 */
export const uuid = 'ec32b'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Transformations5e extends Transformations {
  constructor() {
    super()
    this.sup = '1-3-7'
  }
}
