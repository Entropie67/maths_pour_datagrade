import Exercice4L200 from '../4e/4L20-0-old'

export const titre =
  'Résoudre une équation du premier degré à solutions entières'
export const interactifReady = true

export const dateDePublication = '13/4/2025'

export const uuid = '451d4'
export const refs = {
  'fr-fr': ['BP2AutoK2'],
  'fr-ch': ['NR'],
}

export default class ExerciceEquations extends Exercice4L200 {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaire2Texte = false
    this.sup2 = '1'
  }
}
