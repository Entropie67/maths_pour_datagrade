import AjouterSimpleNombre from './CPCA10'

export const titre = 'Ajouter $8$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '19/12/2025'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '8cd45'

export const refs = {
  'fr-fr': ['CPCA10-8'],
  'fr-ch': [],
}
export default class Ajouter8 extends AjouterSimpleNombre {
  constructor() {
    super()
    this.besoinFormulaire3Texte = false
    this.sup3 = '8'
    this.sup = 1
    this.sup2 = 10
  }
}
