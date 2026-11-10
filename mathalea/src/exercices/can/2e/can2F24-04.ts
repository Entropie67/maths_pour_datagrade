import AntecedentFonctionReference from './can2F3-02_old'

export const titre =
  'Déterminer un antécédent avec la fonction racine carrée (année de transition)'
export const interactifReady = true

export const dateDePublication = '18/08/2026'

export const uuid = 'e27b5'

export const refs = {
  'fr-fr': ['can2F24-04'],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 * @author Gilles Mora
 */
export default class AntecedentFonctionRacineCarree extends AntecedentFonctionReference {
  constructor() {
    super()
    this.typeFonction = 5
    this.besoinFormulaire3Numerique = false
  }
}
