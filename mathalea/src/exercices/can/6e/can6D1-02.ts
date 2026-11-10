import ConversionHeuresMinutesOuMinutesEtSecondes from '../../6e/6M4C-1'
export const titre =
  'Convertir minutes vers heures et minutes ou secondes vers minutes et secondes'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = 'd34e5'

export const refs = {
  'fr-fr': ['can6D1-02', '6M4C-flash3', '3AutoM01-4'],
  'fr-ch': ['NR'],
}
export default class ConvertirMinutesHeures extends ConversionHeuresMinutesOuMinutesEtSecondes {
  constructor() {
    super(true)
    this.nbQuestions = 1

    this.correctionDetailleeDisponible = false
  }
}
