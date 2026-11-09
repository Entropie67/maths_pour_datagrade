import ReconnaitreDesSolides from '../6e/6G8autoA'
export const titre = 'Reconnaître des solides'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDePublication = '30/07/2026'

/**
 * Clone de 6G8autoA pour le Bac Pro Première.
 * Retirer les prismes parmi les types de solides proposés.
 */

export const uuid = 'c93a3'

export const refs = {
  'fr-fr': ['BP1GEO07'],
  'fr-ch': ['NR'],
}
export default class ExerciceBP1GEO07 extends ReconnaitreDesSolides {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.sup = '2-3-4-5-6-7'
  }
}
