import DernierChiffre from '../6e/6N0A-5'
export const titre = "Trouver le dernier chiffre d'une somme entre entiers"
export const amcReady = true
export const interactifReady = true

export const amcType = 'AMCNum'
export const dateDeModifImportante = '19/01/2026'
export const uuid = 'e2a48'
export const refs = {
  'fr-fr': ['CM2N4A-6'],
  'fr-2016': ['c3C12'],
  'fr-ch': ['NR'],
}
export default class DernierChiffreC3 extends DernierChiffre {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireNumerique = false

    this.consigne =
      'Pour chaque somme, déterminer le dernier chiffre du résultat.'
  }
}
