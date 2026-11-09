import AjouterSimpleNombre from './CPCA10'

export const titre = 'Ajouter $3$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '19/12/2025'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '4cb25'

export const refs = {
  'fr-fr': ['CPCA10-3'],
  'fr-ch': [],
}
export default class Ajouter3 extends AjouterSimpleNombre {
  constructor() {
    super()
    this.besoinFormulaire3Texte = false
    this.sup3 = '3'
    this.sup = 1
    this.sup2 = 10
  }
}
