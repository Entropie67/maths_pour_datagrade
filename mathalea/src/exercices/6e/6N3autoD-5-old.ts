import EncodeurTexte from '../profs/P020-old'
export const titre =
  'Message secret à décoder avec les tables de multiplication'
export const interactifReady = false

export const uuid = 'fe6e0'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [''], // Primaire anciennement :['9NO3-14'],
}
export default class MessageCodeAvecTables extends EncodeurTexte {
  constructor() {
    super('exo')
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.besoinCorrection = true

    this.besoinFormulaireTexte = false
    this.besoinFormulaire2CaseACocher = false
    this.besoinFormulaire3Numerique = [
      'Texte à encoder',
      3,
      '1 : Un seul mot\n2 : Une phrase avec la même grille\n3 : Une phrase avec plusieur grilles',
    ]
    this.consigne = ''
  }
}
