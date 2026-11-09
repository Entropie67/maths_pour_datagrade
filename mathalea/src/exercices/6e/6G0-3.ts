import UtiliserLeCodagePourDecrire from './_Utiliser_le_codage_pour_decrire'

export const interactifReady = false
export const titre = 'Utiliser le codage pour décrire ou illustrer une figure'
export const dateDeModifImportante = '17/08/2023'

/**
 * Exercice du test de positionnement 5e
 * Variantes à venir...
 * @author Jean-claude Lhote
 */
export const uuid = 'e8f0b'

export const refs = {
  'fr-fr': ['6G0-3'],
  'fr-2016': ['6G10-2'],
  'fr-ch': ['9R1ES1A-3', '9R2ES1A-3', '9R3ES1A-3'],
}
export default class UtiliserLeCodagePourDecrire6e extends UtiliserLeCodagePourDecrire {
  constructor() {
    super()
    this.classe = 5 // Et non 6, pour mettre les angles en 6e
  }
}
