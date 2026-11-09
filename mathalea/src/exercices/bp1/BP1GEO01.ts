import CosEtsin from '../1e/1AN40'
export const titre = 'Cosinus et sinus des valeurs particulières'
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 1AN40 pour le Bac Pro Première.
 * Seulement les valeurs particulières 0, π/6, π/4, π/3, π/2 et π.
 */

export const uuid = 'ceea6'

export const refs = {
  'fr-fr': ['BP1GEO01'],
  'fr-ch': [],
}
export default class ExerciceBP1GEO01 extends CosEtsin {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.besoinFormulaire2Texte = false
    this.sup = '1'
    this.avecPi = true
  }
}
