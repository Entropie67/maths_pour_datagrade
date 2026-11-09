import CalculProbaExperience2Epreuves3e from '../3e/3S21Old'
export const titre =
  'Simuler une expérience aléatoire à deux épreuves (indépendantes ou avec remise)'
export const dateDePublication = '26/06/2024'
export const interactifReady = true

export const uuid = '4e68a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class CalculProbaExperience2Epreuves2ndeOld extends CalculProbaExperience2Epreuves3e {
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
