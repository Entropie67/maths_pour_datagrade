import PaternRatio from '../4e/4P12-2'
export const titre =
  "Trouver le terme général d'un ratio d'évolution d'un motif géométrique itératif"
export const dateDePublication = '30/05/2026'
export const interactifReady = true

/**
 * @author Éric Elter
 */

export const uuid = '7a6d5'

export const refs = {
  'fr-fr': ['3L16'],
  'fr-ch': ['NR'],
}
export default class PaternRatio3eme extends PaternRatio {
  constructor() {
    super()
    this.niveau = '3e'
    this.sup2 = '4'
    this.sup3 = '101-102'
  }
}
