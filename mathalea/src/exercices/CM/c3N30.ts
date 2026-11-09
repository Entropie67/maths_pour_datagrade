import ExerciceConversions from '../6e/_Exercice_conversions'
export const titre =
  "Conversion d'unités des préfixes k,h,da vers unité de référence"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

// Gestion de la date de publication initiale
export const dateDePublication = '13/11/2020'

/**
 * Conversion vers unité de référence sens multiplication
 * @author Jean-claude Lhote
 * Relecture : Novembre 2021 par EE
 */
export const uuid = 'c9ba6'

export const refs = {
  'fr-fr': ['BP2AutoQ3'],
  'fr-2016': ['c3N30', 'BP2AutoQ3'],
  'fr-ch': ['NR'],
}
export default class ConversionsC3 extends ExerciceConversions {
  constructor() {
    super()
    this.sup = 1
    this.nbQuestions = 5
    this.sup2 = false
  }
}
