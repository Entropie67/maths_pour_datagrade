import FonctionsProbabilite1 from '../6e/6P2B-1'
export const titre =
  'Calculer des probabilités dans une expérience aléatoire à une épreuve'
export const interactifReady = true

/**
 * @author Sébastien LOZANO
 */
export const uuid = '28dfd'

export const refs = {
  'fr-fr': ['2P10-2', 'BP2FLUC1', 'BP1AUTO001'],
  'fr-ch': ['4mProbStat-16'],
}
export default class FonctionsProbabilite12nde extends FonctionsProbabilite1 {
  constructor() {
    super()
    this.styleCorrection = 'lycee'
  }
}
