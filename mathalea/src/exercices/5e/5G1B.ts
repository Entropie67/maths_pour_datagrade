import ReperagePointDuPlan from './5G1B-2'
export const titre = "Déterminer les coordonnées (positives) d'un point"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '24/11/2024'
export const uuid = 'cf83c'
export const refs = {
  'fr-fr': ['5G1B'],
  'fr-2016': ['5R12'],
  'fr-ch': ['9R1ES5A-1', '9R2ES5A-1', '9R3ES5A-1', 'PRQPF02A-1'],
}
export default class ReperagePointDuQuartDePlan extends ReperagePointDuPlan {
  constructor() {
    super()
    this.quartDePlan = true
  }
}
