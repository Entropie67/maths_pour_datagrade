import AntecedentFonctionReference from './can2F3-02_old'

export const titre = 'Déterminer des antécédents avec la valeur absolue'
export const interactifReady = true

export const dateDePublication = '18/08/2026'

export const uuid = 'a72c9'

export const refs = {
  'fr-fr': ['can2F24-03'],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 * @author Gilles Mora
 */
export default class AntecedentValeurAbsolue extends AntecedentFonctionReference {
  constructor() {
    super()
    this.typeFonction = 1
    this.besoinFormulaire3Numerique = false
  }
}
