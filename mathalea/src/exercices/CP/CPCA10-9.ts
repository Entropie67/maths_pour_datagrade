import AjouterSimpleNombre from './CPCA10'

export const titre = 'Ajouter $9$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '17/12/2025'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '3ca25'

export const refs = {
  'fr-fr': ['CPCA10-9'],
  'fr-ch': [],
}
export default class Ajouter9 extends AjouterSimpleNombre {
  constructor() {
    super()
    this.besoinFormulaire3Texte = false
    this.sup3 = '9'
  }
}
