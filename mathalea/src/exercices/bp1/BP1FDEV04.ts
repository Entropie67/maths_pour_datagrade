import DeriverUPlusV from '../1e/1AN14-4'
export const titre = 'Dériver une fonction du type $u + v$'
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 1AN14-4 pour le Bac Pro Première.
 * Choisir uniquement polynôme et inverse dans les types de fonctions.
 */

export const uuid = '33f4f'

export const refs = {
  'fr-fr': ['BP1FDEV04'],
  'fr-ch': [],
}
export default class ExerciceBP1FDEV04 extends DeriverUPlusV {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.sup = '1'
  }
}
