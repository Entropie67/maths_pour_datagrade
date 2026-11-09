import NotationPuissance from '../4e/4C33-0'
export const titre = 'Utiliser la notation puissance'
export const dateDePublication = '01/05/2025'
export const interactifReady = true

/**
 * Clone de can4C33-0 pour la 5e
 * @author Rémi Angot
 */

export const uuid = '974d1'

export const refs = {
  'fr-fr': ['5_2026_P2'],
  'fr-2016': ['5_2026_P2'],
  'fr-ch': ['NR'],
}
export default class NotationPuissance5e extends NotationPuissance {
  constructor() {
    super()
    this.classe = 5
    this.besoinFormulaire2Numerique = false
    this.besoinFormulaire3Numerique = false
    this.besoinFormulaire4Numerique = false
    this.besoinFormulaire5Numerique = false
    this.sup2 = 1
    this.sup3 = 1
    this.sup4 = 1
    this.sup5 = 1
  }
}
