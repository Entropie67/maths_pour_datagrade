import ConversionHeuresMinutesOuMinutesEtSecondes from '../../6e/6M4C-1'
export const titre = 'Convertir de secondes vers min et secondes'
export const dateDePublication = '04/12/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * @author Éric Elter
 */

export const uuid = '5992a'

export const refs = {
  'fr-fr': ['can6D1-06', '6M4C-flash7'],
  'fr-ch': ['NR'],
}
export default class can6D10 extends ConversionHeuresMinutesOuMinutesEtSecondes {
  constructor() {
    super()
    this.besoinFormulaireNumerique = false
    this.sup = 2
    this.nbQuestions = 1
  }
}
