import AntecedentFonctionReference from './can2F3-02_old'

export const titre = 'Déterminer des antécédents avec la fonction carré'
export const interactifReady = true

export const dateDePublication = '18/08/2026'

export const uuid = 'b18d4'

export const refs = {
  'fr-fr': ['can2F24-01', '2F23-flash1'],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 * @author Gilles Mora
 */
export default class AntecedentFonctionCarre extends AntecedentFonctionReference {
  constructor() {
    super()
    this.typeFonction = 2
    this.besoinFormulaire3Numerique = false
  }
}
