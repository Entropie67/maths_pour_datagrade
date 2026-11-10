import EncodeurTexte from '../profs/P020'
export const titre =
  'Message secret à décoder avec les tables de multiplication'
export const dateDeModifImportante = '30/10/2026'
export const interactifReady = false

export const uuid = 'fe6e1'

export const refs = {
  'fr-fr': ['6N3autoD-5', '5N3autoA-4', '5N4autoA-4'],
  'fr-2016': ['6C10-8'],
  'fr-ch': ['9R1NO6A-7', '9R2NO6A-7', '9R3NO6A-7'], // Primaire anciennement :['9NO3-14'],
}
export default class MessageCodeAvecTables extends EncodeurTexte {
  constructor() {
    super('exo')
    this.sup3 = 1
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.besoinCorrection = true

    this.besoinFormulaireTexte = false
    this.besoinFormulaire2CaseACocher = false
    this.besoinFormulaire3Numerique = [
      'Texte à encoder',
      3,
      '1 : Un seul mot\n2 : Une phrase avec la même grille\n3 : Une phrase avec plusieurs grilles',
    ]
    this.consigne = ''
  }
}
