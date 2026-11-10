import ConstruireParSymetrie from '../6e/_Construire_par_symetrie'
export const titre =
  'Construire le symétrique de différents points par rapport à une droite'
export const interactifReady = false
export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '14/11/2021'
/**
 * @author Jean-Claude Lhote
 */
export const uuid = 'ce9ef'

export const refs = {
  'fr-fr': ['5G3autoB'],
  'fr-2016': ['5G10-1'],
  'fr-ch': ['9R1ES4B-8', '9R2ES4B-8', '9R3ES4B-8'],
}
export default class SymetrieAxialePoint5e extends ConstruireParSymetrie {
  constructor() {
    super()
    this.figure = false
    this.sup = 4
    this.sup2 = 3
    this.besoinFormulaireNumerique = [
      'Type de questions',
      4,
      '1 : Axe horizontal ou vertical\n2 : Axe oblique à 45°\n3 : Axe avec une légère pente\n4 : Mélange',
    ]
  }
}
