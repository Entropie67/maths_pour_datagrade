import Exercice2F111 from '../2e/2F22-1'
export const titre = "Déterminer l'image d'un nombre par la fonction carrée"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const uuid = '9e538'

export const refs = {
  'fr-fr': ['BP2FONC30'],
  'fr-ch': ['NR'],
}
export default class ExerciceBPFONC28 extends Exercice2F111 {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = false // ['Fonction carré']
    this.besoinFormulaire2CaseACocher = false // ['Fonction cube']
    this.besoinFormulaire3CaseACocher = false // ['Fonction racine carrée']
    this.besoinFormulaire4CaseACocher = false // ['Fonction inverse']
    this.sup = true
    this.sup2 = false
    this.sup3 = false
    this.sup4 = false
  }
}
