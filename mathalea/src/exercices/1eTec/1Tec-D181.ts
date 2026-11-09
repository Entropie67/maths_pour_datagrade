import Equationdetangente from '../1e/1AN11-3'

export const titre =
  'Déterminer une équation de tangente avec image et nombre dérivé'
export const interactifReady = true

export const dateDePublication = '22/04/2026'
export const uuid = 'da914'
export const refs = {
  'fr-fr': ['1Tec-D13'],
  'fr-ch': [],
}

export default class Equationdetangente1Tec extends Equationdetangente {
  constructor() {
    super()
    this.sup = '1' // Force seulement la question 1
    this.besoinFormulaireTexte = false
  }
}
