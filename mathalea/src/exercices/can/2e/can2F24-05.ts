import AntecedentFonctionReference from './can2F3-02_old'

export const titre =
  'Déterminer un antécédent avec la fonction cube (année de transition)'
export const interactifReady = true

export const dateDePublication = '18/08/2026'

export const uuid = 'd94f1'

export const refs = {
  'fr-fr': ['can2F24-05'],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 * @author Gilles Mora
 */
export default class AntecedentFonctionCube extends AntecedentFonctionReference {
  constructor() {
    super()
    this.typeFonction = 4
    this.besoinFormulaire3Numerique = false
  }
}
