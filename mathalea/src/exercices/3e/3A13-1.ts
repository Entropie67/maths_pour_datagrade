import DivisionsEuclidiennesEgaliteFondamentale from '../6e/6N2J-1'
export const titre = 'Poser divisions euclidiennes'
export const dateDePublication = '14/09/2022'
export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

/**
 * Poser et effectuer les divisions euclidiennes suivantes puis donner l'égalité fondamentale correspondante.
 *
 * @author Éric Elter
 */

export const uuid = '8741f'

export const refs = {
  'fr-fr': ['3A13-1'],
  'fr-ch': ['NR'],
}
export default class DivisionsEuclidiennes3e extends DivisionsEuclidiennesEgaliteFondamentale {
  constructor() {
    super()
    this.classe = 3
    this.sup = 2
  }
}
