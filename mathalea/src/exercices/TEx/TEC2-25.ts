import NomExercice from '../can/Ex/canTEC2-02'
export const titre = "Résoudre |z-z'|=|z-z''|"
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = '7f034'
export const refs = {
  'fr-fr': ['TEC2-25'],
  'fr-ch': [],
}

/**
 * Même tirage que canTEC2-02, avec en paramètre le nommage des points A et B.
 * @author Stéphane Guyon
 */
export default class ResoudreEquationModulesTEC2 extends NomExercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      "Nommer les points A et B dans l'énoncé",
      true,
    ]
    this.sup = true
  }

  nouvelleVersion() {
    this.nommerPoints = Boolean(this.sup)
    super.nouvelleVersion()
  }
}
