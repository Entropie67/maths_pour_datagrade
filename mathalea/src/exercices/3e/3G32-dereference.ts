import problemesTrigoLongueur from './3G32-0'
export const titre = "Calculer la largeur d'une rivière"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * @author Guillaume Valmont
 * reference 3G32
 */
export const uuid = '95adb'
// déréférencé car inutile
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

export default class CalculHauteurMontagne extends problemesTrigoLongueur {
  declare sup2: string

  constructor() {
    super()
    this.sup2 = '6'
    this.besoinFormulaireCaseACocher = false
  }
}
