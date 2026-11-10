import ComparerCalculsFractions from './1A-C01-10'

export const uuid = 'cb5ea'
export const refs = {
  'fr-fr': ['1A-C01-11'],
  'fr-ch': [],
}
export const interactifReady = true
export const interactifType = 'mathLive'

export const titre = 'Comparer deux calculs avec des fractions'
export const dateDePublication = '30/10/2026'

/**
 * Comparer deux calculs avec des fractions (somme, produit, petite puissance).
 * Le code est celui de 1A-C01-10.
 * @author Gilles Mora
 */
export default class ComparerDeuxCalculsFractions extends ComparerCalculsFractions {
  constructor() {
    super()
    this.deuxCalculs = true
  }
}
