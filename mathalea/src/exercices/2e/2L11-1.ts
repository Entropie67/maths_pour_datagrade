import SimpleDistributivite from '../3e/3L11-0'

export const titre = 'Effectuer la simple distributivité'

export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '20/02/2025'
/**
 * Clone de 3L11-0 pour les secondes
 *
 * @author Gilles Mora
 */
export const uuid = '0c61c'

export const refs = {
  'fr-fr': ['2L11-1'],
  'fr-ch': ['NR'],
}
export default class SimpleDistributiviteSeconde extends SimpleDistributivite {
  constructor() {
    super()
    this.sup = '5'
    this.sup2 = true
  }
}
