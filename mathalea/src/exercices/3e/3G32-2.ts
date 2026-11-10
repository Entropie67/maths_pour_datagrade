import problemesTrigoLongueur from '../3e/3G32-0'
export const titre = "Calculer la hauteur d'un objet vu sous un angle donné"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDeModifImportante = '10/10/2025'

/**
 * @author Guillaume Valmont
 */
export const uuid = '5986b'

export const refs = {
  'fr-fr': ['3G32-2'],
  'fr-ch': [],
}
export default class CalculHauteurObjet extends problemesTrigoLongueur {
  declare sup2: number

  constructor() {
    super()
    this.sup2 = 3
    this.besoinFormulaireCaseACocher = false
  }
}
