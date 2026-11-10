import ExerciceComparerDeuxFractions from '../6e/6N3I-3'
export const titre = 'Comparer deux fractions (dénominateurs multiples)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const uuid = 'd7e11'
export const refs = {
  'fr-fr': ['4C20', 'BP2AutoG1'],
  'fr-ch': ['9R1NO4H-8', '9R2NO4H-8', '9R3NO4H-8', 'PRQNO05B-3'],
}
export default class ExerciceComparerDeuxFractions4e extends ExerciceComparerDeuxFractions {
  constructor() {
    super()
    this.sup = 11
    this.besoinFormulaire2CaseACocher = ['Inclure des nombres négatifs']
    this.sup2 = true
  }
}
