import Thales2D from './_Thales2D'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const titre = 'Calculer des longueurs avec le théorème de Thalès'
export const uuid = '18a21'
export const refs = {
  'fr-fr': ['4G30', 'BP2AutoR9', 'BP2G10'],
  'fr-ch': ['PRQMG03C-2'],
}
export default class Thales2D4e extends Thales2D {
  constructor() {
    super()
    this.level = 4
    this.besoinFormulaireNumerique = false
    this.video = 'nFgFG3YQ1O4'
  }
}
