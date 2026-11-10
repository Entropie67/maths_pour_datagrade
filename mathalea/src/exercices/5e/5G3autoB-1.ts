import ConstruireParSymetrie from '../6e/_Construire_par_symetrie'

export const titre =
  "Construire le symétrique d'un triangle par rapport à une droite"
export const interactifReady = false
export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '14/11/2021'
/**
 * @author Jean-claude Lhote
 */
export const uuid = '8ea24'

export const refs = {
  'fr-fr': ['5G3autoB-1'],
  'fr-2016': ['5G10-2'],
  'fr-ch': ['9R1ES4B-7', '9R2ES4B-7', '9R3ES4B-7'],
}
export default class SymetrieAxialeFigure5e extends ConstruireParSymetrie {
  constructor() {
    super()
    this.figure = true
    this.sup = 4
    this.sup2 = 3
    this.besoinFormulaireNumerique = [
      'Type de questions',
      4,
      '1 : Axe horizontal ou vertical\n2 : Axe oblique à 45°\n3 : Axe avec une légère pente\n4 : Mélange',
    ]
  }
}
