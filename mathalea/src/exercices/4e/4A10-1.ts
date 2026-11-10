import ExerciceLabyrinthePremiers3e from '../3e/3A10-7'
export const titre = 'Explorer un labyrinthe de nombres premiers'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '12/10/2022'
export const uuid = '5066e'
export const refs = {
  'fr-fr': ['4A10-1'],
  'fr-ch': ['NR'],
}

/** Explorer un labyrinthe de nombres premiers
 * @author Éric Elter // Sur la base d'autres labyrinthes déjà créés
 * Passage en multiMahField et AMC par Éric Elter (13/04/2026)
 */

export default class ExerciceLabyrinthePremiers4e extends ExerciceLabyrinthePremiers3e {
  constructor() {
    super()
    this.sup = 2
  }
}
