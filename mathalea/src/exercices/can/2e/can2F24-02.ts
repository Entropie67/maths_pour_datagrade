import AntecedentFonctionReference from './can2F3-02_old'

export const titre = 'Déterminer un antécédent avec la fonction inverse'
export const interactifReady = true

export const dateDePublication = '18/08/2026'

export const uuid = 'c63ea'

export const refs = {
  'fr-fr': ['can2F24-02', '2F23-flash2'],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 * @author Gilles Mora
 */
export default class AntecedentFonctionInverse extends AntecedentFonctionReference {
  constructor() {
    super()
    this.typeFonction = 3
    this.besoinFormulaire3Numerique = false
  }
}
