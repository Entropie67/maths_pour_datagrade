import LireAbscissesFractionnairesComplexes from '../CM2/CM2N2F-1'

export const titre =
  "Lire l'abscisse d'un point sur une droite graduée en tiers, en quarts, en moitiés, en dixièmes"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '27/08/2026'

/**
 * @author Éric Elter
 */

export const uuid = '82ed5'

export const refs = {
  'fr-fr': ['5N3autoD'],
  'fr-ch': ['NR'],
}
export default class LireAbscissesFractionnaires extends LireAbscissesFractionnairesComplexes {
  constructor() {
    super()
    this.sup = '2-3-4-10'
  }
}
