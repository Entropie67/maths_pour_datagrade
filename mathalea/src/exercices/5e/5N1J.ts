import ExerciceLabyrintheDivisibilite from './5N1I-4'
export const dateDePublication = '01/05/2026'
export const interactifReady = true

export const titre =
  'Parcourir un labyrinthe de multiples basé sur les critères de divisibilité par $3$ et par $9$'

/**
 * @author Éric Elter
 */

export const uuid = 'fd0f8'

export const refs = {
  'fr-fr': ['5N1J'],
  'fr-2016': ['5A11-1b'],
  'fr-ch': ['NR'],
}
export default class ExerciceLabyrintheDivisibilite3Ou9 extends ExerciceLabyrintheDivisibilite {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Critères de divisibilité pour chaque question (soit 3, soit 9)',
      'Nombres séparés par des tirets :',
    ]
    this.sup = '3-9'
    this.version = 'Que3et9'
  }
}
