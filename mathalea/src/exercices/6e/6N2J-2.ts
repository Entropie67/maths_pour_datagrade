import DivisionsEuclidiennesEgaliteFondamentale from './6N2J-1'

export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

export const titre = 'Effectuer divisions euclidiennes - Niveau $2$'

/**
 * @author Rémi Angot
 */

export const uuid = 'bbcac'

export const refs = {
  'fr-fr': ['6N2J-2'],
  'fr-2016': ['6C21'],
  'fr-ch': ['NR'], // Primaire anciennement :['9NO3-4'],
}
export default class DivisionsEuclidiennesNiv2 extends DivisionsEuclidiennesEgaliteFondamentale {
  constructor() {
    super()
    this.sup = 3
  }
}
