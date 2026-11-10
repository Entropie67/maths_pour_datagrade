import DefinitionProprietesTriangles from '../5e/DefinitionProprietesTriangles'
export const titre = "Connaître la somme des angles d'un triangle"
export const dateDePublication = '10/06/2026'
export const interactifReady = true

/**
 * Pour les nouveaux programmes de 6ème
 * @author Éric Elter
 */

export const uuid = '04439'

export const refs = {
  'fr-fr': ['6G6C'],
  'fr-ch': ['NR'],
}
export default class DefinitionProprietesTrianglesSommesDesAngles extends DefinitionProprietesTriangles {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = '5-6'
  }
}
