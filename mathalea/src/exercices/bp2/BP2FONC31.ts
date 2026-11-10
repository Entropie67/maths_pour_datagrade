import Exercice2F121 from '../2e/2F23-1'
export const titre =
  'Résoudre algébriquement une équation $f(x)=k$ avec la fonction carrée'
export const interactifReady = true

export const uuid = 'fd10b'

export const refs = {
  'fr-fr': ['BP2FONC31'],
  'fr-ch': [],
}
export default class ExerciceBPFONC31 extends Exercice2F121 {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = false
    this.sup = 1
  }
}
