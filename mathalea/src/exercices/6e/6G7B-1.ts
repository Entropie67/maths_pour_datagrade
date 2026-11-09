import ConstruireParSymetrie from './_Construire_par_symetrie'
export const titre =
  "Construire le symétrique d'un point par rapport à une droite"
export const dateDeModifImportante = '14/11/2021'
export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = false

/**
 * @author Jean-claude Lhote
 * Relecture : Novembre 2021 par EE
 */
export const uuid = '91a00'

export const refs = {
  'fr-fr': ['6G7B-1'],
  'fr-2016': ['6G24-1'],
  'fr-ch': ['NR'],
}
export default class SymetrieAxialePoint6e extends ConstruireParSymetrie {
  constructor() {
    super()
    this.figure = false
    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Type de questions',
      4,
      '1 : Axe horizontal ou vertical\n2 : Axe oblique à 45°\n3 : Axe avec une légère pente\n4 : Toutes les symétries axiales',
    ]
  }
}
