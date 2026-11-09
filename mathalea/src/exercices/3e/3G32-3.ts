import ProblemesTrigoLongueur from './3G32-0'

export const titre = "Calculer la hauteur d'une falaise"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '10/10/2025'

/**
 * @author Guillaume Valmont
 */
export const uuid = 'e42e0'

export const refs = {
  'fr-fr': ['3G32-3'],
  'fr-ch': [],
}
export default class CalculHauteurFalaise extends ProblemesTrigoLongueur {
  declare sup2: number

  constructor() {
    super()
    this.sup2 = 4
    this.besoinFormulaireCaseACocher = false
  }
}
