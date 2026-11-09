import ExerciceLabyrinthePremiers3e from '../3e/3A10-7'
export const titre = 'Parcourir un labyrinthe de nombres premiers'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '12/10/2022'
export const dateDeModifImportante = '29/10/2024'
export const uuid = '0507e'
export const refs = {
  'fr-fr': ['5N1L-2'],
  'fr-2016': ['5A12-3'],
  'fr-ch': ['NR'],
}

/** Explorer un labyrinthe de nombres premiers
 * @author Éric Elter // Sur la base d'autres labyrinthes déjà créés
 * Passage en multiMahField et AMC par Éric Elter (13/04/2026)
 */

export default class ExerciceLabyrinthePremiers5e extends ExerciceLabyrinthePremiers3e {
  constructor() {
    super()
    this.sup = 1
  }
}
