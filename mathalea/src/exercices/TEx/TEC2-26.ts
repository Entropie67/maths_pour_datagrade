import NomExercice from '../can/Ex/canTEC2-03'
export const titre = "Résoudre |z-z'|=r"
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = '45385'
export const refs = {
  'fr-fr': ['TEC2-26'],
  'fr-ch': [],
}

/**
 * Même tirage que canTEC2-03, avec en paramètre le nommage du point A.
 * @author Stéphane Guyon
 */
export default class ResoudreEquationModuleTEC2 extends NomExercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ["Nommer le point A dans l'énoncé", true]
    this.sup = true
  }

  nouvelleVersion() {
    this.nommerPoint = Boolean(this.sup)
    super.nouvelleVersion()
  }
}
