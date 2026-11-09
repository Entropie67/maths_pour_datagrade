import ConstruireUnTriangle from './6G6A-1'
export const titre =
  'Construire un triangle quelconque avec les instruments et auto-vérification'
export const interactifReady = false
export const dateDePublication = '17/12/2022'

/**
 * Construire un triangle quelconque avec les instruments et auto-vérification
 *
 * @author Mickael Guironnet
 */
export const uuid = 'f4fdd'

export const refs = {
  'fr-fr': ['6G6A-3'],
  'fr-2016': ['6G21-2'],
  'fr-ch': ['NR'],
}
export default class ConstruireUnTriangleQuelconque extends ConstruireUnTriangle {
  constructor() {
    super()

    this.sup = 4
    this.nbQuestions = 6
  }
}
