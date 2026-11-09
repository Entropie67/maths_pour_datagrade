import ExerciceEquationASolutionEntiere from '../4e/4L20-0-old'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const titre =
  'Résoudre une équation du premier degré à solutions entières'
export const uuid = '5a02b'
export const refs = {
  'fr-fr': ['3L13-0', 'BP2RES11', 'BP1AUTO022'],
  'fr-ch': ['10LCFA5C-8', '10LSFA5C-8', '11CTFA4C-8', '11LCFA4C-8', '11LSFA4C-8', 'PRQAL05B-2'],
}
export default class EquationPremierDegreSolutionsEntieres extends ExerciceEquationASolutionEntiere {
  constructor() {
    super()
    this.sup = true // Avec des nombres relatifs
    this.sup2 = 4 // Choix du type d'équation
    this.nbQuestions = 6
  }
}
