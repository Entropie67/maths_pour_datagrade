import CalculProbaExperience2Epreuves3e from '../3e/3S20-1'
export const titre =
  'Simuler une expérience aléatoire à deux épreuves (indépendantes ou avec remise)'
export const dateDePublication = '26/06/2024'
export const dateDeModificationImportante = '18/04/2026' // passage en multiMathfield
export const interactifReady = true

export const uuid = '4e68b'
export const refs = {
  'fr-fr': ['2P10-1'],
  'fr-ch': ['11CTNO4A-6', '11LCNO4A-6', '11LSNO4A-6'],
}
/**
 * @author Jean-Claude Lhote
 */
export default class CalculProbaExperience2Epreuves2nde extends CalculProbaExperience2Epreuves3e {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions : ',
      'Nombres séparés par des tirets :\n1 : Deux épreuves indépendantes\n2 : Deux épreuves avec remise\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Avec un arbre', false]
    this.niveau = '2nde'
    this.sup2 = true
  }
}
