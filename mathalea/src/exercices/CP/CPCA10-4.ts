import AjouterSimpleNombre from './CPCA10'

export const titre = 'Ajouter $4$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '19/12/2025'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '4cb35'

export const refs = {
  'fr-fr': ['CPCA10-4'],
  'fr-ch': [],
}
export default class Ajouter4 extends AjouterSimpleNombre {
  constructor() {
    super()
    this.besoinFormulaire3Texte = false
    this.sup3 = '4'
    this.sup = 1
    this.sup2 = 10
  }
}
