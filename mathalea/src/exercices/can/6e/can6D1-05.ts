import ConversionHeuresMinutesOuMinutesEtSecondes from '../../6e/6M4C-1'
export const titre = 'Convertir de minutes vers heures et minutes'
export const dateDePublication = '04/12/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * @author Éric Elter
 */

export const uuid = '45885'

export const refs = {
  'fr-fr': ['can6D1-05', '6M4C-flash6'],
  'fr-ch': ['NR'],
}
export default class can6D10 extends ConversionHeuresMinutesOuMinutesEtSecondes {
  constructor() {
    super()
    this.besoinFormulaireNumerique = false
    this.sup = 1
    this.nbQuestions = 1
  }
}
