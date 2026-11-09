import MultipleDistributivite from '../3e/3L11-1b'

export const titre = 'Effectuer la double distributivité'

export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '20/02/2025'
/**
 * Clone de 3L11-1b pour les secondes
 *
 * @author Gilles Mora
 */
export const uuid = '35d63'

export const refs = {
  'fr-fr': ['2L11-2'],
  'fr-ch': ['NR'],
}
export default class MultipleDistributiviteSeconde extends MultipleDistributivite {
  constructor() {
    super()
    this.sup = 3
    this.sup2 = 3
    this.sup3 = 3
    this.sup4 = 3
  }
}
