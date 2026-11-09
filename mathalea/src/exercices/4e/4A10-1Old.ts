import ExerciceLabyrinthePremiers3eOld from '../3e/3A10-7Old'
export const titre = 'Explorer un labyrinthe de nombres premiers'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '12/10/2022'
export const uuid = '50663'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/** Explorer un labyrinthe de nombres premiers
 * @author Éric Elter // Sur la base d'autres labyrinthes déjà créés
 */

export default class ExerciceLabyrinthePremiers4eOld extends ExerciceLabyrinthePremiers3eOld {
  constructor() {
    super()
    this.sup = 2
  }
}
