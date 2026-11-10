import TracerQuadrilatèresParticuliers from './CM2G3D-1'

export const titre = 'Tracer des carrés et rectangles et auto-vérification'
export const dateDePublication = '19/12/2022'
export const interactifReady = false

/**
 * Tracer des des carrés et rectangles et auto-vérification
 *
 * @author Mickael Guironnet
 */

export const uuid = '4f9a6'

export const refs = {
  'fr-fr': ['CM2G3D-2'],
  'fr-2016': ['6G13-1'],
  'fr-ch': ['NR'],
}
export default class ConstruireCarréOuRectangles extends TracerQuadrilatèresParticuliers {
  constructor() {
    super()
    this.sup = '1-2-3-4'
    this.nbQuestions = 6
  }
}
