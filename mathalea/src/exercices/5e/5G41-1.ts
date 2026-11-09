import TracerQuadrilatèresParticuliers from '../CM2/CM2G3D-2'

export const interactifReady = false
export const titre =
  'Construire des losanges ou des parallélogrammes et auto-vérification'
export const dateDePublication = '19/12/2022'

/**
 * Tracer des losanges ou des parallélogrammes et auto-vérification
 *
 * @author Mickael Guironnet
 */

export const uuid = '3fc85'

export const refs = {
  'fr-fr': [],
  'fr-2016': ['6G21-4'],
  'fr-ch': ['NR'],
}
export default class ConstruireLosangesOuParallélogrammes extends TracerQuadrilatèresParticuliers {
  constructor() {
    super()
    this.sup = '5-6-7'
    this.nbQuestions = 6
  }
}
