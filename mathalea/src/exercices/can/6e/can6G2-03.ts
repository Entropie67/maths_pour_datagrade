import NombreDeFacesEtDAretes from '../../6e/6G0-9'

export const titre = 'Compter les arêtes et les faces'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé le 7/11/2021

 */
export const uuid = '86ea3'

export const refs = {
  'fr-fr': ['can6G2-03', '6AutoE1-2'],
  'fr-ch': ['NR'],
}
export default class NombreDeFacesEtDAretesExo extends NombreDeFacesEtDAretes {
  version: number
  constructor() {
    super()
    this.nbQuestions = 1
    this.version = 3
    this.besoinFormulaireNumerique = false
  }
}
