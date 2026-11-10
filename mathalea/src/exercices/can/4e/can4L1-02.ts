import ExerciceEquationASolutionEntiere from '../../4e/4L20-0-old'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const titre = 'Résoudre une équation $ax+b=c$'
export const uuid = 'c5700'
export const refs = {
  'fr-fr': ['can4L1-02'],
  'fr-ch': ['NR'],
}
export default class UneEquationMoyenne extends ExerciceEquationASolutionEntiere {
  constructor() {
    super()
    this.nbQuestions = 1
    this.correctionDetaillee = false
    this.sup = false
    this.sup2 = 2
    this.consigne = "Résoudre l'équation :"
  }
}
