import ExerciceLabyrinthePremiers3eOld from '../3e/3A10-7Old'
export const titre = 'Parcourir un labyrinthe de nombres premiers'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '12/10/2022'
export const dateDeModifImportante = '29/10/2024'
export const uuid = '05079'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/** Explorer un labyrinthe de nombres premiers
 * @author Éric Elter // Sur la base d'autres labyrinthes déjà créés
 */

export default class ExerciceLabyrinthePremiers5eOld extends ExerciceLabyrinthePremiers3eOld {
  constructor() {
    super()
    this.sup = 1
  }
}
