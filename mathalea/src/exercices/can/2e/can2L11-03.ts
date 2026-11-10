import identitesCalculs from '../../3e/3L11-5'
export const interactifReady = true

export const titre = 'Calculer avec les identités remarquables'
export const uuid = 'c0f74'
export const refs = {
  'fr-fr': ['can2L11-03'],
  'fr-ch': [],
}
export default class IdentitesCalculs2e extends identitesCalculs {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    this.can = true
    this.canVersion = 'v2'
    this.consigne =
      'Effectuer le calcul suivant sans calculatrice.<br>Utiliser la double distributivité ou les identités remarquables.'
    this.typeExercice = 'simple'
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      "1 : Carré d'une somme\n2 : Carré d'une différence\n3 : Produit de la somme et de la différence",
    ]
  }
}
