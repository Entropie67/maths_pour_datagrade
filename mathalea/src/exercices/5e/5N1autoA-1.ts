import ExerciceLabyrintheDivisibilite from './5N1I-4'
export const dateDePublication = '12/07/2027'
export const interactifReady = true

export const titre =
  'Parcourir un labyrinthe de multiples basé sur les critères de divisibilité par $2$, par $5$ ou par $10$'

/**
 * @author Éric Elter
 */

export const uuid = '8ab9b'

export const refs = {
  'fr-fr': ['5N1autoA-1'],
  'fr-2016': ['5A11-1b'],
  'fr-ch': ['NR'],
}
export default class ExerciceLabyrintheDivisibilite25ou10 extends ExerciceLabyrintheDivisibilite {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Critères de divisibilité pour chaque question (soit 2, soit 5, soit 10)',
      'Nombres séparés par des tirets :',
    ]
    this.sup = '2-5-10'
    this.version = 'Que25et10'
  }
}
