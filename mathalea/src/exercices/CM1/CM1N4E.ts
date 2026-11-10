import ExerciceMultiplierOuDiviserUnNombreEntierPar101001000 from '../6e/6N0A-13'
export const dateDePublication = '01/02/2026'
export const interactifReady = true

export const titre = 'Multiplier un nombre entier par $10$, $100$ ou $1\\,000$'

/**
 * @author Éric Elter
 */

export const uuid = 'da45c'

export const refs = {
  'fr-fr': ['CM1N4E'],
  'fr-ch': ['9R1NO6E-1', '9R2NO6E-1', '9R3NO6E-1'],
}
export default class ExerciceMultiplierUnNombreEntierPar101001000 extends ExerciceMultiplierOuDiviserUnNombreEntierPar101001000 {
  constructor() {
    super()
    this.besoinFormulaireNumerique = false
    this.sup = 1
    this.nbQuestions = 3
  }
}
