import DivisionsEuclidiennesEgalite2 from '../6e/6N2K-3'
export const titre =
  "Déterminer reste et quotient d'une division euclidienne à partir d'une égalité"
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '14/09/2022'

/**
 * Détermination du reste et quotient à partir de l'égalité découlant de la division euclidienne
 *
 * @author Éric Elter
 */

export const uuid = 'd8bf2'

export const refs = {
  'fr-fr': ['3A13-2'],
  'fr-ch': ['NR'],
}
export default class DivisionsEuclidiennesEgalite3e extends DivisionsEuclidiennesEgalite2 {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = 1
  }
}
