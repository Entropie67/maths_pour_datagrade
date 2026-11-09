import PaternRatioOld from '../5e/5P12-2-old'
export const titre = "Trouver le terme général d'un pattern géométrique"
export const dateDePublication = '30/05/2026'
export const interactifReady = true

/**
 * @author Éric Elter
 */

export const uuid = 'fe750'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class PaternRatio3emeOld extends PaternRatioOld {
  constructor() {
    super()
    this.niveau = '3e'
    this.sup2 = '4'
    this.sup3 = '101-102'
  }
}
